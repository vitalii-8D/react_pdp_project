import { useEffect, useState } from 'react';
import { Form, Link, useFetcher, useSearchParams } from 'react-router';

import type { Route } from './+types/users';
import { requireUserFromContext } from '../../lib/auth.server';
import { searchUsersFullQuery, type SearchUsersInput, type SearchUsersResult } from '../../lib/graphql/users.server';
import { avatarUrl } from '../../lib/images';
import { paths } from '../../lib/paths';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { buttonStyles } from '../../components/Button';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { MIN_QUERY_LENGTH } from '../../lib/search-constants';

const RADIUS_OPTIONS = [
  { label: 'Any distance', value: '' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 25 km', value: '25' },
  { label: 'Within 100 km', value: '100' },
];

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token, user } = await requireUserFromContext(request, context);
  const params = new URL(request.url).searchParams;

  const q = params.get('q') ?? '';
  const isQueryTooShort = q.length > 0 && q.length < MIN_QUERY_LENGTH;
  const radiusKm = params.get('radiusKm') ?? '';
  const cursor = params.get('cursor') ?? '';
  const hasLocation = user.latitude != null && user.longitude != null;

  const input: SearchUsersInput = {
    ...(q && { query: q }),
    ...(radiusKm && hasLocation && { useMyLocation: true, radiusKm: Number(radiusKm) }),
    ...(cursor && { cursor }),
  };

  const result: SearchUsersResult = isQueryTooShort
    ? { items: [], nextCursor: null }
    : await searchUsersFullQuery(token, input);

  return { result, filters: { q, radiusKm }, hasLocation, isQueryTooShort };
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const { result, filters, hasLocation, isQueryTooShort } = loaderData;

  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<{ result: SearchUsersResult }>();

  const [items, setItems] = useState(result.items);
  const [nextCursor, setNextCursor] = useState(result.nextCursor);

  const [queryDraft, setQueryDraft] = useState(filters.q);
  const trimmedQueryDraft = queryDraft.trim();
  const isSearchDisabled = trimmedQueryDraft.length > 0 && trimmedQueryDraft.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    setItems(result.items);
    setNextCursor(result.nextCursor);
  }, [result]);

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setItems((prev) => [...prev, ...fetcher.data!.result.items]);
      setNextCursor(fetcher.data!.result.nextCursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  const canLoadMore = Boolean(nextCursor) && fetcher.state === 'idle';
  const loadMore = () => {
    if (!nextCursor || fetcher.state !== 'idle') return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('cursor', nextCursor);
    fetcher.load(`?${nextParams.toString()}`);
  };
  const sentinelRef = useInfiniteScroll(loadMore, canLoadMore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Users</h1>
        <p className="text-slate-500 mt-1">Find people in the community, near you or anywhere.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <Form
          method="get"
          className="flex flex-col sm:flex-row gap-3 sm:items-end"
          onSubmit={(event) => {
            if (isSearchDisabled) event.preventDefault();
          }}
        >
          <div className="flex-grow">
            <TextField
              id="q"
              label="Search"
              name="q"
              type="text"
              value={queryDraft}
              onChange={(event) => setQueryDraft(event.target.value)}
              placeholder="Name, email, city..."
            />
          </div>
          <div className="w-full sm:w-56">
            <label htmlFor="radiusKm" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Near me
            </label>
            <select
              id="radiusKm"
              name="radiusKm"
              defaultValue={filters.radiusKm}
              disabled={!hasLocation}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isSearchDisabled} className={buttonStyles()}>
            Search
          </button>
        </Form>
        <p className="text-xs text-slate-400 mt-3">Type at least 3 characters to search.</p>
        {!hasLocation && (
          <p className="text-xs text-slate-400 mt-1">
            <Link to={paths.profileEdit()} className="text-blue-600 hover:underline">
              Add your location in your profile
            </Link>{' '}
            to search for people nearby.
          </p>
        )}
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">
            {isQueryTooShort ? 'Type at least 3 characters to search.' : 'No users found.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((user) => (
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

      <div ref={sentinelRef} />
      {fetcher.state !== 'idle' && <p className="text-center text-sm text-slate-400 py-2">Loading more…</p>}
    </div>
  );
}
