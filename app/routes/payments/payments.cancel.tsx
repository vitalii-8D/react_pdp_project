import { Link } from 'react-router';

import type { Route } from './+types/payments.cancel';
import { requireToken } from '../../lib/auth.server';
import { paths } from '../../lib/paths';
import { Card } from '../../components/Card';
import { buttonStyles } from '../../components/Button';

export async function loader({ request }: Route.LoaderArgs) {
  await requireToken(request);
  const url = new URL(request.url);
  return { postId: url.searchParams.get('postId') };
}

export default function PaymentsCancel({ loaderData }: Route.ComponentProps) {
  const { postId } = loaderData;

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-black text-slate-900">Payment cancelled</h1>
        <p className="text-slate-500 mt-2">Your post hasn&apos;t been published. You can try again any time.</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          {postId && (
            <Link to={paths.myPostEdit(postId)} className={buttonStyles({ size: 'lg' })}>
              Back to Post
            </Link>
          )}
          <Link to={paths.myPosts()} className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
            Go to My Posts
          </Link>
        </div>
      </Card>
    </div>
  );
}
