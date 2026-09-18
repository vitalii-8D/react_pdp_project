import { redirect, type ActionFunctionArgs } from 'react-router';

import { requireUserFromContext } from '../../lib/auth.server';
import { startDirectMessageMutation } from '../../lib/graphql/chat.server';
import { toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';

// Shared by chat.start-dm.tsx and chat-v2.start-dm.tsx: only the redirect target (which chat room
// route the new DM lands on) differs between the two transports.
export function createStartDmAction(roomPath: (id: string) => string) {
  return async function action({ request, context }: ActionFunctionArgs) {
    const { token } = await requireUserFromContext(request, context);
    const formData = await request.formData();
    const userId = String(formData.get(ChatFormField.UserId) ?? '');

    try {
      const room = await startDirectMessageMutation(token, userId);
      return redirect(roomPath(room.id));
    } catch (error) {
      return toActionError(error, 'Could not start the conversation.');
    }
  };
}
