import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { ChatMessageEntity, ChatRoomEntity } from '../types';

const CHAT_ROOM_FIELDS = gql`
  fragment ChatRoomFields on ChatRoomEntity {
    id
    name
    description
    isDirect
    participants {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
`;

const CHAT_MESSAGE_FIELDS = gql`
  fragment ChatMessageFields on ChatMessageEntity {
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
    attachments {
      id
      key
      url
      originalFileName
      mimeType
      sizeBytes
    }
  }
`;

export async function chatRoomsQuery(token: string): Promise<ChatRoomEntity[]> {
  const query = gql`
    ${CHAT_ROOM_FIELDS}
    query ChatRooms {
      chatRooms {
        ...ChatRoomFields
      }
    }
  `;

  const data = await gqlRequest<{ chatRooms: ChatRoomEntity[] }>(query, undefined, token);

  return data.chatRooms;
}

export async function myDirectMessageRoomsQuery(token: string): Promise<ChatRoomEntity[]> {
  const query = gql`
    ${CHAT_ROOM_FIELDS}
    query MyDirectMessageRooms {
      myDirectMessageRooms {
        ...ChatRoomFields
      }
    }
  `;

  const data = await gqlRequest<{ myDirectMessageRooms: ChatRoomEntity[] }>(query, undefined, token);

  return data.myDirectMessageRooms;
}

export async function startDirectMessageMutation(token: string, userId: string): Promise<ChatRoomEntity> {
  const query = gql`
    ${CHAT_ROOM_FIELDS}
    mutation StartDirectMessage($userId: ID!) {
      startDirectMessage(userId: $userId) {
        ...ChatRoomFields
      }
    }
  `;

  const data = await gqlRequest<{ startDirectMessage: ChatRoomEntity }>(query, { userId }, token);

  return data.startDirectMessage;
}

export async function chatRoomQuery(token: string, id: string): Promise<ChatRoomEntity> {
  const query = gql`
    ${CHAT_ROOM_FIELDS}
    query ChatRoom($id: ID!) {
      chatRoom(id: $id) {
        ...ChatRoomFields
      }
    }
  `;

  const data = await gqlRequest<{ chatRoom: ChatRoomEntity }>(query, { id }, token);

  return data.chatRoom;
}

export async function chatRoomMessagesQuery(token: string, roomId: string): Promise<ChatMessageEntity[]> {
  const query = gql`
    ${CHAT_MESSAGE_FIELDS}
    query ChatRoomMessages($roomId: ID!) {
      chatRoomMessages(roomId: $roomId) {
        ...ChatMessageFields
      }
    }
  `;

  const data = await gqlRequest<{ chatRoomMessages: ChatMessageEntity[] }>(query, { roomId }, token);

  return data.chatRoomMessages;
}

export interface CreateChatRoomInput {
  name: string;
  description?: string;
}

export async function createChatRoomMutation(token: string, input: CreateChatRoomInput): Promise<ChatRoomEntity> {
  const query = gql`
    ${CHAT_ROOM_FIELDS}
    mutation CreateChatRoom($createRoomInput: CreateRoomInput!) {
      createChatRoom(createRoomInput: $createRoomInput) {
        ...ChatRoomFields
      }
    }
  `;

  const data = await gqlRequest<{ createChatRoom: ChatRoomEntity }>(query, { createRoomInput: input }, token);

  return data.createChatRoom;
}
