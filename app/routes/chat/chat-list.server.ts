import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';

import { requireUserFromContext } from '../../lib/auth.server';
import { chatRoomsQuery, createChatRoomMutation, myDirectMessageRoomsQuery } from '../../lib/graphql/chat.server';
import { toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';
import { UserRole } from '../../enums/user-role.enum';

// Shared by chat.tsx and chat-v2.tsx: the room list, direct-message list, and room-creation
// action are identical for both transports (only the JSX copy/paths differ, see ChatRoomList).
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { token, user } = await requireUserFromContext(request, context);
  const [rooms, directRooms] = await Promise.all([chatRoomsQuery(token), myDirectMessageRoomsQuery(token)]);

  return {
    rooms,
    directRooms,
    currentUserId: user.id,
    isAdmin: user.role === UserRole.ADMIN,
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { token, user } = await requireUserFromContext(request, context);
  if (user.role !== UserRole.ADMIN) {
    return data({ error: 'Only admins can create rooms.' }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get(ChatFormField.Name) ?? '').trim();
  const description = String(formData.get(ChatFormField.Description) ?? '').trim();

  try {
    await createChatRoomMutation(token, {
      name,
      ...(description && { description }),
    });
    return { ok: true as const };
  } catch (error) {
    return toActionError(error, 'Could not create the room.');
  }
}
