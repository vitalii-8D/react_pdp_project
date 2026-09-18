import { data, type RouterContextProvider } from 'react-router';

import { requireUserFromContext } from '../../lib/auth.server';
import { chatRoomQuery } from '../../lib/graphql/chat.server';
import { GqlRequestError } from '../../lib/graphql-client.server';
import { UserRole } from '../../enums/user-role.enum';
import type { ChatRoomEntity } from '../../lib/types';

interface ChatRoomContext {
  token: string;
  room: ChatRoomEntity;
  currentUserId: string;
  isAdmin: boolean;
}

export async function loadChatRoom(
  request: Request,
  context: Readonly<RouterContextProvider>,
  roomId: string,
): Promise<ChatRoomContext> {
  const { token, user } = await requireUserFromContext(request, context);

  let room: ChatRoomEntity;
  try {
    room = await chatRoomQuery(token, roomId);
  } catch (error) {
    if (error instanceof GqlRequestError) {
      throw data(error.message, { status: error.status });
    }
    throw error;
  }

  return { token, room, currentUserId: user.id, isAdmin: user.role === UserRole.ADMIN };
}
