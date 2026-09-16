import { data } from 'react-router';

import { chatRoomQuery } from '../../lib/graphql/chat.server';
import { chatRoomMessagesV2Query } from '../../lib/graphql/chat-v2.server';
import type { Route } from './+types/chat-v2.$roomId';
import { requireUser } from '../../lib/auth.server';
import { GqlRequestError } from '../../lib/graphql-client.server';
import { getGraphqlHttpUrl, getGraphqlWsUrl } from '../../lib/socket-url.server';
import { UserRole } from '../../enums/user-role.enum';
import { ChatWindowV2 } from '../../components/ChatWindowV2';

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

  const messages = await chatRoomMessagesV2Query(token, params.roomId);

  return {
    token,
    room,
    messages,
    currentUserId: user.id,
    isAdmin: user.role === UserRole.ADMIN,
    graphqlHttpUrl: getGraphqlHttpUrl(),
    graphqlWsUrl: getGraphqlWsUrl(),
  };
}

export default function ChatV2Room({ loaderData }: Route.ComponentProps) {
  return <ChatWindowV2 {...loaderData} />;
}
