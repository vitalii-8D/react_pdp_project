import type { Route } from './+types/chat-v2';
import { paths } from '../../lib/paths';
import { ChatRoomList } from '../../components/ChatRoomList';

export { loader, action } from '../chat/chat-list.server';

export default function ChatV2({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <ChatRoomList
      title="Chat V2"
      subtitle="Same rooms and messages as Chat, but real-time updates run over GraphQL subscriptions instead of Socket.IO."
      rooms={loaderData.rooms}
      directRooms={loaderData.directRooms}
      currentUserId={loaderData.currentUserId}
      isAdmin={loaderData.isAdmin}
      actionData={actionData}
      roomPath={paths.chatV2Room}
      searchAction={paths.chatV2UsersSearch()}
      startDmAction={paths.chatV2StartDm()}
      formIdPrefix="chat-v2"
    />
  );
}
