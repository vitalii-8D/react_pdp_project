import { data } from 'react-router';

import { chatRoomMessagesQuery, chatRoomQuery } from '../../lib/graphql/chat.server';
import type { Route } from './+types/chat.$roomId';
import { requireUser } from '../../lib/auth.server';
import { GqlRequestError } from '../../lib/graphql-client.server';
import { getSocketUrl } from '../../lib/socket-url.server';
import { UserRole } from '../../enums/user-role.enum';
import { ChatWindow } from '../../components/ChatWindow';

export async function loader({ request, params }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);

  let room;
  try {
    room = await chatRoomQuery(token, params.roomId);
  } catch (error) {
    if (error instanceof GqlRequestError) {
      throw data(error.message, { status: error.status });
    }
    throw error;
  }

  const messages = await chatRoomMessagesQuery(token, params.roomId);

  return {
    token,
    room,
    messages,
    currentUserId: user.id,
    isAdmin: user.role === UserRole.ADMIN,
    socketUrl: getSocketUrl(),
  };
}

export default function ChatRoom({ loaderData }: Route.ComponentProps) {
  return <ChatWindow {...loaderData} />;
}
