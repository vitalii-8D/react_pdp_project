import { Link } from 'react-router';

import type { Route } from './+types/profile';
import { requireUser } from '../../lib/auth.server';
import { avatarUrl } from '../../lib/images';
import { paths } from '../../lib/paths';
import { Icons } from '../../components/Icons';
import { Card } from '../../components/Card';
import { buttonStyles } from '../../components/Button';

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await requireUser(request);
  return { user };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="max-w-xl">
      <Card className="p-8 text-center">
        <img
          src={user.avatar?.url ?? avatarUrl(user.id)}
          alt={user.name}
          className="h-24 w-24 rounded-full object-cover mx-auto ring-4 ring-blue-50"
        />
        <h1 className="text-2xl font-black text-slate-900 mt-4">{user.name}</h1>
        <p className="text-slate-500">{user.email}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-left">
          <div className="bg-slate-50 rounded-xl p-4">
            <dt className="text-xs font-semibold text-slate-400 uppercase">Age</dt>
            <dd className="text-sm font-bold text-slate-800 mt-1">{user.age ?? '—'}</dd>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <dt className="text-xs font-semibold text-slate-400 uppercase">Role</dt>
            <dd className="text-sm font-bold text-slate-800 mt-1 capitalize">{user.role.toLowerCase()}</dd>
          </div>
        </dl>

        <Link to={paths.profileEdit()} className={buttonStyles({ size: 'lg', className: 'mt-6' })}>
          <Icons.Edit />
          Edit Profile
        </Link>
      </Card>
    </div>
  );
}
