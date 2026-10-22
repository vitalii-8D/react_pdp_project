import type { Route } from './+types/chat-v2.broadcast';
import { requireTokenFromContext } from '../../lib/auth.server';
import { adminBroadcastChatMutation } from '../../lib/graphql/chat.server';
import { toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';

export async function action({ request, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const message = String(formData.get(ChatFormField.Message) ?? '').trim();

  try {
    await adminBroadcastChatMutation(token, message);

    return { ok: true };
  } catch (error) {
    return toActionError(error, 'Could not send the broadcast.');
  }
}
