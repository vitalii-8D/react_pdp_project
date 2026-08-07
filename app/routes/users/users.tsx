import type { Route } from './+types/users';
import { requireToken } from '../../lib/auth.server';
import { usersQuery } from '../../lib/graphql/users.server';
import { avatarUrl } from '../../lib/images';
import { Card } from '../../components/Card';

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireToken(request);
  const users = await usersQuery(token);

  return { users };
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">Everyone who&apos;s part of the community.</p>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No users found.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <Card key={user.id} className="p-5 flex items-center space-x-4">
              <div className="relative shrink-0">
                <img
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                  src={user.avatar?.url ?? avatarUrl(user.id)}
                  alt={user.name}
                />
                {user.isOnline && (
                  <span
                    title="Online"
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                {user.city && <p className="text-xs text-slate-400 truncate">{user.city}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
