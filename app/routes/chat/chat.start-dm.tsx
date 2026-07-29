import { redirect } from "react-router";

import type { Route } from "./+types/chat.start-dm";
import { requireUser } from "../../lib/auth.server";
import { startDirectMessageMutation } from "../../lib/graphql/chat.server";
import { toActionError } from "../../lib/graphql-client.server";
import { paths } from "../../lib/paths";
import { ChatFormField } from "../../enums/chat-form-field.enum";

export async function action({ request }: Route.ActionArgs) {
  const { token } = await requireUser(request);
  const formData = await request.formData();
  const userId = String(formData.get(ChatFormField.UserId) ?? "");

  try {
    const room = await startDirectMessageMutation(token, userId);
    return redirect(paths.chatRoom(room.id));
  } catch (error) {
    return toActionError(error, "Could not start the conversation.");
  }
}
