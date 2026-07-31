import { data, Form, Link, useNavigation } from 'react-router';

import type { Route } from './+types/chat';
import { requireUser } from '../../lib/auth.server';
import { chatRoomsQuery, createChatRoomMutation, myDirectMessageRoomsQuery } from '../../lib/graphql/chat.server';
import { toActionError } from '../../lib/graphql-client.server';
import { paths } from '../../lib/paths';
import { ChatFormField } from '../../enums/chat-form-field.enum';
import { UserRole } from '../../enums/user-role.enum';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { UserSearch } from '../../components/UserSearch';

export async function loader({ request }: Route.LoaderArgs) {
  const { token, user } = await requireUser(request);
  const [rooms, directRooms] = await Promise.all([chatRoomsQuery(token), myDirectMessageRoomsQuery(token)]);
  return {
    rooms,
    directRooms,
    currentUserId: user.id,
    isAdmin: user.role === UserRole.ADMIN,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { token, user } = await requireUser(request);
  if (user.role !== UserRole.ADMIN) {
    return data({ error: 'Only admins can create rooms.' }, { status: 403 });
  }

  const formData = await request.formData();
  const name = String(formData.get(ChatFormField.Name) ?? '').trim();
  const description = String(formData.get(ChatFormField.Description) ?? '').trim();

  try {
    await createChatRoomMutation(token, {
      name,
      ...(description && { description }),
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error, 'Could not create the room.');
  }
}

export default function Chat({ loaderData, actionData }: Route.ComponentProps) {
  const { rooms, directRooms, currentUserId, isAdmin } = loaderData;
  const navigation = useNavigation();
  const pending = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Chat</h1>
        <p className="text-slate-500 mt-1">Join a room to start chatting in real time.</p>
      </div>

      {rooms.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No chat rooms yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link key={room.id} to={paths.chatRoom(room.id)}>
              <Card className="p-5 h-full hover:border-blue-200 hover:shadow-md transition-all">
                <h2 className="font-bold text-slate-900">{room.name}</h2>
                {room.description && <p className="text-sm text-slate-500 mt-1">{room.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Direct Messages</h2>
          <p className="text-slate-500 text-sm mt-1">Search for a user to start a private conversation.</p>
        </div>

        <UserSearch />

        {directRooms.length > 0 && (
          <div className="space-y-3">
            {directRooms.map((room) => {
              const otherParticipant = room.participants.find((participant) => participant.id !== currentUserId);
              return (
                <Link key={room.id} to={paths.chatRoom(room.id)}>
                  <Card className="p-4 hover:border-blue-200 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-900">{otherParticipant?.name ?? room.name}</h3>
                    {otherParticipant && <p className="text-sm text-slate-500">{otherParticipant.email}</p>}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {isAdmin && (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Create a room</h2>
          {actionData && 'error' in actionData && <p className="text-sm text-red-600">{actionData.error}</p>}
          <Form method="post" className="space-y-4">
            <TextField id="chat-room-name" name={ChatFormField.Name} label="Name" required />
            <TextField id="chat-room-description" name={ChatFormField.Description} label="Description (optional)" />
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create room'}
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
}
