import { chatRoomMessagesV2Query, sendChatMessageV2Mutation } from '../../lib/graphql/chat-v2.server';
import type { Route } from './+types/chat-v2.$roomId';
import { requireTokenFromContext } from '../../lib/auth.server';
import { getGraphqlWsUrl, toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';
import { loadChatRoom } from '../chat/chat-room.server';
import { ChatWindowV2 } from '../../components/ChatWindowV2';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { token, room, currentUserId, isAdmin } = await loadChatRoom(request, context, params.roomId);
  const messages = await chatRoomMessagesV2Query(token, params.roomId);

  return {
    token,
    room,
    messages,
    currentUserId,
    isAdmin,
    graphqlWsUrl: getGraphqlWsUrl(),
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const message = String(formData.get(ChatFormField.Message) ?? '').trim();

  try {
    await sendChatMessageV2Mutation(token, params.roomId, message);
    return { ok: true };
  } catch (error) {
    return toActionError(error, 'Could not send the message.');
  }
}

export default function ChatV2Room({ loaderData }: Route.ComponentProps) {
  return <ChatWindowV2 {...loaderData} />;
}
