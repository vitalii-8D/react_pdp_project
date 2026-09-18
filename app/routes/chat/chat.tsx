import type { Route } from './+types/chat';
import { paths } from '../../lib/paths';
import { ChatRoomList } from '../../components/ChatRoomList';

export { loader, action } from './chat-list.server';

export default function Chat({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <ChatRoomList
      title="Chat"
      subtitle="Join a room to start chatting in real time."
      rooms={loaderData.rooms}
      directRooms={loaderData.directRooms}
      currentUserId={loaderData.currentUserId}
      isAdmin={loaderData.isAdmin}
      actionData={actionData}
      roomPath={paths.chatRoom}
      searchAction={paths.chatUsersSearch()}
      startDmAction={paths.chatStartDm()}
      formIdPrefix="chat"
    />
  );
}
