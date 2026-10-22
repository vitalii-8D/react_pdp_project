import { chatRoomMessagesQuery, sendChatMessageMutation } from '../../lib/graphql/chat.server';
import type { Route } from './+types/chat-v2.$roomId';
import { requireTokenFromContext } from '../../lib/auth.server';
import { getGraphqlWsUrl, toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';
import { loadChatRoom } from '../chat/chat-room.server';
import { ChatWindowV2 } from '../../components/ChatWindowV2';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { token, room, currentUserId, isAdmin } = await loadChatRoom(request, context, params.roomId);
  const messages = await chatRoomMessagesQuery(token, params.roomId);

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
    await sendChatMessageMutation(token, params.roomId, message);

    return { ok: true };
  } catch (error) {
    return toActionError(error, 'Could not send the message.');
  }
}

export default function ChatV2Room({ loaderData }: Route.ComponentProps) {
  // Keyed by room: switching rooms remounts the window, so its local state (messages, drafts,
  // presence) starts fresh from props instead of being reset in an effect.
  return <ChatWindowV2 key={loaderData.room.id} {...loaderData} />;
}
