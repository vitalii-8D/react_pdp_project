import { print } from 'graphql';

import { ChatMessageAddedDocument, ChatRoomPresenceDocument } from '../../graphql/__generated__/graphql';

// Chat V2's real-time GraphQL subscriptions, used directly from the browser over graphql-ws -
// kept out of chat.server.ts because that file's `.server.ts` suffix strips it from the client
// bundle, and ChatWindowV2 needs these in the browser. graphql-ws takes the operation as a string,
// so the generated documents are printed once here. Mutations (sending a message, broadcasting) go
// through this app's own route actions instead - see chat-v2.$roomId.tsx's `action` and
// chat-v2.broadcast.tsx.
export const CHAT_MESSAGE_ADDED_SUBSCRIPTION = print(ChatMessageAddedDocument);
export const CHAT_ROOM_PRESENCE_SUBSCRIPTION = print(ChatRoomPresenceDocument);

export type { ChatMessageAddedSubscription, ChatRoomPresenceSubscription } from '../../graphql/__generated__/graphql';
