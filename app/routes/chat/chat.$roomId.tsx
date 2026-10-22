import { chatRoomMessagesQuery } from '../../lib/graphql/chat.server';
import type { Route } from './+types/chat.$roomId';
import { getSocketUrl } from '../../lib/chat-transport.server';
import { loadChatRoom } from './chat-room.server';
import { ChatWindow } from '../../components/ChatWindow';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { token, room, currentUserId, isAdmin } = await loadChatRoom(request, context, params.roomId);
  const messages = await chatRoomMessagesQuery(token, params.roomId);

  return { token, room, messages, currentUserId, isAdmin, socketUrl: getSocketUrl() };
}

export default function ChatRoom({ loaderData }: Route.ComponentProps) {
  // Keyed by room: switching rooms remounts the window, so its local state (messages, drafts,
  // presence) starts fresh from props instead of being reset in an effect.
  return <ChatWindow key={loaderData.room.id} {...loaderData} />;
}
