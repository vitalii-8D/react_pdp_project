import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useFetcher } from 'react-router';
import { createClient, type Client } from 'graphql-ws';

import {
  CHAT_MESSAGE_ADDED_SUBSCRIPTION,
  CHAT_ROOM_PRESENCE_SUBSCRIPTION,
  type ChatPresenceEvent,
} from '../lib/graphql/chat-v2-browser';
import { ChatFormField } from '../enums/chat-form-field.enum';
import { paths } from '../lib/paths';
import type { ChatMessageEntity, ChatRoomEntity } from '../lib/types';
import { Button } from './Button';
import { Card } from './Card';

type ChatMutationResult = { error: string } | { ok: true };

interface ChatWindowV2Props {
  graphqlWsUrl: string;
  token: string;
  room: ChatRoomEntity;
  messages: ChatMessageEntity[];
  currentUserId: string;
  isAdmin: boolean;
}

export function ChatWindowV2({
  graphqlWsUrl,
  token,
  room,
  messages: initialMessages,
  currentUserId,
  isAdmin,
}: ChatWindowV2Props) {
  const otherParticipant = room.isDirect
    ? room.participants.find((participant) => participant.id !== currentUserId)
    : undefined;
  const displayName = otherParticipant?.name ?? room.name;

  const clientRef = useRef<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessageEntity[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [broadcastDraft, setBroadcastDraft] = useState('');

  // Sending a message / broadcasting are route actions now (see chat-v2.$roomId.tsx and
  // chat-v2.broadcast.tsx), so pending/error state comes from the fetchers instead of local
  // `sending`/`broadcasting` flags and a hand-rolled `fetch` call.
  const sendFetcher = useFetcher<ChatMutationResult>();
  const broadcastFetcher = useFetcher<ChatMutationResult>();
  const sending = sendFetcher.state !== 'idle';
  const broadcasting = broadcastFetcher.state !== 'idle';

  useEffect(() => {
    const client = createClient({
      url: graphqlWsUrl,
      connectionParams: () => ({ authorization: `Bearer ${token}` }),
      on: {
        connected: () => setConnected(true),
        closed: () => setConnected(false),
      },
    });
    clientRef.current = client;

    return () => {
      void client.dispose();
      clientRef.current = null;
    };
  }, [graphqlWsUrl, token]);

  useEffect(() => {
    const client = clientRef.current;
    setMessages(initialMessages);
    setPresence(null);
    setError(null);

    if (!client) {
      return;
    }

    const unsubscribeMessages = client.subscribe<{ chatMessageAdded: ChatMessageEntity }>(
      { query: CHAT_MESSAGE_ADDED_SUBSCRIPTION, variables: { roomId: room.id } },
      {
        next: ({ data }) => {
          if (data) {
            setMessages((prev) => [...prev, data.chatMessageAdded]);
          }
        },
        error: (err) => setError(err instanceof Error ? err.message : 'Subscription error.'),
        complete: () => {},
      },
    );

    const unsubscribePresence = client.subscribe<{ chatRoomPresence: ChatPresenceEvent }>(
      { query: CHAT_ROOM_PRESENCE_SUBSCRIPTION, variables: { roomId: room.id } },
      {
        next: ({ data }) => {
          if (!data) {
            return;
          }
          const { type, userName } = data.chatRoomPresence;
          setPresence(`${userName} ${type === 'JOINED' ? 'joined' : 'left'} the room`);
        },
        error: (err) => setError(err instanceof Error ? err.message : 'Subscription error.'),
        complete: () => {},
      },
    );

    return () => {
      unsubscribeMessages();
      unsubscribePresence();
    };
  }, [room.id]);

  useEffect(() => {
    if (sendFetcher.state !== 'idle' || !sendFetcher.data) {
      return;
    }
    if ('error' in sendFetcher.data) {
      setError(sendFetcher.data.error);
    } else {
      setDraft('');
    }
  }, [sendFetcher.state, sendFetcher.data]);

  useEffect(() => {
    if (broadcastFetcher.state !== 'idle' || !broadcastFetcher.data) {
      return;
    }
    if ('error' in broadcastFetcher.data) {
      setError(broadcastFetcher.data.error);
    } else {
      setBroadcastDraft('');
    }
  }, [broadcastFetcher.state, broadcastFetcher.data]);

  function handleSendMessage(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }

    setError(null);
    void sendFetcher.submit({ [ChatFormField.Message]: message }, { method: 'post' });
  }

  function handleBroadcast(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = broadcastDraft.trim();
    if (!message) {
      return;
    }

    setError(null);
    void broadcastFetcher.submit(
      { [ChatFormField.Message]: message },
      { method: 'post', action: paths.chatV2Broadcast() },
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{displayName}</h1>
          {!room.isDirect && room.description && <p className="text-slate-500 text-sm mt-0.5">{room.description}</p>}
          {room.isDirect && otherParticipant && (
            <p className="text-slate-500 text-sm mt-0.5">{otherParticipant.email}</p>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            connected
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {connected ? 'Connected (GraphQL subscription)' : 'Connecting...'}
        </span>
      </div>

      {presence && <p className="text-xs text-slate-400 shrink-0">{presence}</p>}
      {error && <p className="text-sm text-red-600 shrink-0">{error}</p>}

      <Card className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-slate-400 text-sm m-auto">No messages yet. Say hello!</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === currentUserId;
            return (
              <div key={message.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    message.isAdminBroadcast
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : isOwn
                        ? 'bg-blue-50 text-blue-900 border border-blue-100'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {message.isAdminBroadcast && (
                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Announcement</p>
                  )}
                  <p>{message.message}</p>
                </div>
                <span className="text-xs text-slate-400 mt-1">{isOwn ? 'You' : message.user.name}</span>
              </div>
            );
          })
        )}
      </Card>

      <div className="shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            className="flex-grow rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button type="submit" disabled={sending || !draft.trim()}>
            Send
          </Button>
        </form>
      </div>

      {isAdmin && !room.isDirect && (
        <Card className="p-4 space-y-2 bg-amber-50/50 border-amber-200 shrink-0">
          <p className="text-sm font-bold text-amber-900">Broadcast to all rooms</p>
          <form onSubmit={handleBroadcast} className="flex gap-2">
            <input
              value={broadcastDraft}
              onChange={(event) => setBroadcastDraft(event.target.value)}
              placeholder="Announcement message..."
              className="flex-grow rounded-xl border border-amber-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <Button type="submit" variant="secondary" disabled={broadcasting || !broadcastDraft.trim()}>
              Broadcast
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
