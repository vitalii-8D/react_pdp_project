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
  return <ChatWindow {...loaderData} />;
}
