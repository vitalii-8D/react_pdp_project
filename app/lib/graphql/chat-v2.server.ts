import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { ChatMessageEntity } from '../types';

// Chat V2's BE schema doesn't include the `attachments` field (that's part of the chat-attachments
// feature, which chat V2's real-time work doesn't touch) - so this fragment mirrors
// CHAT_MESSAGE_FIELDS from chat.server.ts minus `attachments`, and the loader below fills in an
// empty array so `ChatMessageEntity`'s shape stays the same for shared UI code.
const CHAT_MESSAGE_V2_FIELDS = gql`
  fragment ChatMessageV2Fields on ChatMessageEntity {
    id
    message
    userId
    user {
      id
      name
      email
    }
    roomId
    createdAt
    isAdminBroadcast
  }
`;

export async function chatRoomMessagesV2Query(token: string, roomId: string): Promise<ChatMessageEntity[]> {
  const query = gql`
    ${CHAT_MESSAGE_V2_FIELDS}
    query ChatRoomMessagesV2($roomId: ID!) {
      chatRoomMessages(roomId: $roomId) {
        ...ChatMessageV2Fields
      }
    }
  `;

  const data = await gqlRequest<{ chatRoomMessages: Omit<ChatMessageEntity, 'attachments'>[] }>(
    query,
    { roomId },
    token,
  );

  return data.chatRoomMessages.map((message) => ({ ...message, attachments: [] }));
}

export async function sendChatMessageV2Mutation(token: string, roomId: string, message: string): Promise<void> {
  const query = gql`
    mutation SendChatMessageV2($input: SendMessageInput!) {
      sendChatMessage(sendMessageInput: $input) {
        id
      }
    }
  `;

  await gqlRequest(query, { input: { roomId, message } }, token);
}

export async function adminBroadcastChatV2Mutation(token: string, message: string): Promise<void> {
  const query = gql`
    mutation AdminBroadcastChatV2($message: String!) {
      adminBroadcastChat(message: $message) {
        id
      }
    }
  `;

  await gqlRequest(query, { message }, token);
}
