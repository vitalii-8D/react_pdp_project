import { gqlRequest } from '../graphql-client.server';
import {
  AdminBroadcastChatDocument,
  ChatRoomDocument,
  ChatRoomMessagesDocument,
  ChatRoomsDocument,
  CreateChatRoomDocument,
  SendChatMessageDocument,
  StartDirectMessageDocument,
  type ChatRoomsQuery,
  type CreateRoomInput,
} from '../../graphql/__generated__/graphql';
import type { ChatMessageEntity, ChatRoomEntity } from '../types';

// One request for both lists - `chatRooms` + `myDirectMessageRooms` are two root fields of the
// same query.
export async function chatRoomsQuery(token: string): Promise<ChatRoomsQuery> {
  return gqlRequest(ChatRoomsDocument, {}, token);
}

export async function startDirectMessageMutation(token: string, userId: string): Promise<ChatRoomEntity> {
  const data = await gqlRequest(StartDirectMessageDocument, { userId }, token);

  return data.startDirectMessage;
}

export async function chatRoomQuery(token: string, id: string): Promise<ChatRoomEntity> {
  const data = await gqlRequest(ChatRoomDocument, { id }, token);

  return data.chatRoom;
}

// History for both transports, attachments included. For Socket.IO chat it always comes from this
// HTTP query: the socket's `joinedRoom` payload also carries messages, but the backend loads them
// without attachments.
export async function chatRoomMessagesQuery(token: string, roomId: string): Promise<ChatMessageEntity[]> {
  const data = await gqlRequest(ChatRoomMessagesDocument, { roomId }, token);

  return data.chatRoomMessages;
}

export async function createChatRoomMutation(token: string, input: CreateRoomInput): Promise<ChatRoomEntity> {
  const data = await gqlRequest(CreateChatRoomDocument, { createRoomInput: input }, token);

  return data.createChatRoom;
}

// Chat V2 sends and broadcasts over plain GraphQL mutations; the new message then comes back to
// every subscriber (including the sender) via the `chatMessageAdded` subscription.
export async function sendChatMessageMutation(token: string, roomId: string, message: string): Promise<void> {
  await gqlRequest(SendChatMessageDocument, { input: { roomId, message } }, token);
}

export async function adminBroadcastChatMutation(token: string, message: string): Promise<void> {
  await gqlRequest(AdminBroadcastChatDocument, { message }, token);
}
