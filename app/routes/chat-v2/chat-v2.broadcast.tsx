import type { Route } from './+types/chat-v2.broadcast';
import { requireTokenFromContext } from '../../lib/auth.server';
import { adminBroadcastChatV2Mutation } from '../../lib/graphql/chat-v2.server';
import { toActionError } from '../../lib/graphql-client.server';
import { ChatFormField } from '../../enums/chat-form-field.enum';

export async function action({ request, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const message = String(formData.get(ChatFormField.Message) ?? '').trim();

  try {
    await adminBroadcastChatV2Mutation(token, message);
    return { ok: true };
  } catch (error) {
    return toActionError(error, 'Could not send the broadcast.');
  }
}
