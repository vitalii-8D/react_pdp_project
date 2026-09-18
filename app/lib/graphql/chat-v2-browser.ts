// Chat V2's real-time GraphQL subscriptions, used directly from the browser over graphql-ws -
// kept out of chat-v2.server.ts because that file's `.server.ts` suffix strips it from the client
// bundle, and ChatWindowV2 needs these query strings in the browser. Mutations (sending a message,
// broadcasting) go through this app's own route actions instead - see chat-v2.$roomId.tsx's
// `action` and chat-v2.broadcast.tsx - so only the subscription strings live here.
export const CHAT_MESSAGE_ADDED_SUBSCRIPTION = /* GraphQL */ `
  subscription ChatMessageAddedV2($roomId: ID!) {
    chatMessageAdded(roomId: $roomId) {
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
  }
`;

export const CHAT_ROOM_PRESENCE_SUBSCRIPTION = /* GraphQL */ `
  subscription ChatRoomPresenceV2($roomId: ID!) {
    chatRoomPresence(roomId: $roomId) {
      type
      roomId
      userId
      userName
    }
  }
`;

export interface ChatPresenceEvent {
  type: 'JOINED' | 'LEFT';
  roomId: string;
  userId: string;
  userName: string;
}
