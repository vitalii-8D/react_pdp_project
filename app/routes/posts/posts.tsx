import { useEffect, useState } from 'react';
import { Form, useFetcher, useSearchParams } from 'react-router';

import type { Route } from './+types/posts';
import { getOptionalUserFromContext } from '../../lib/auth.server';
import { searchPostsQuery, type SearchPostsInput, type SearchPostsResult } from '../../lib/graphql/posts.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { PostCard } from '../../components/PostCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { MIN_QUERY_LENGTH } from '../../lib/search-constants';

const READING_TIME_BUCKETS = [
  { label: 'Any length', value: '' },
  { label: 'Under 5 min', value: '5' },
  { label: 'Under 15 min', value: '15' },
];

function decodeCursor(cursor: string | null): string[] | undefined {
  if (!cursor) return undefined;
  try {
    const parsed: unknown = JSON.parse(atob(cursor));
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { token, user } = getOptionalUserFromContext(context);
  const params = new URL(request.url).searchParams;

  const q = params.get('q') ?? '';
  const isQueryTooShort = q.length > 0 && q.length < MIN_QUERY_LENGTH;
  const categories = params.getAll('category');
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const maxReading = params.get('maxReading') ?? '';
  const cursor = params.get('cursor');
  const isCursorValid = Boolean(decodeCursor(cursor));

  const input: SearchPostsInput = {
    ...(q && { query: q }),
    ...(categories.length > 0 && { categories }),
    ...((from || to) && { createdAt: { ...(from && { from }), ...(to && { to }) } }),
    ...(maxReading && { readingTime: { max: Number(maxReading) } }),
    ...(isCursorValid && { cursor: cursor! }),
  };

  const searchPromise: Promise<SearchPostsResult> = isQueryTooShort
    ? Promise.resolve({ items: [], nextCursor: null })
    : searchPostsQuery(token, input);

  const [result, allCategories] = await Promise.all([searchPromise, categoriesQuery(token)]);

  return {
    result,
    allCategories,
    currentUserId: user?.id,
    filters: { q, categories, from, to, maxReading },
    isQueryTooShort,
  };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  const { result, allCategories, currentUserId, filters, isQueryTooShort } = loaderData;

  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<{ result: SearchPostsResult }>();

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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Community Posts</h1>
        <p className="text-slate-500 mt-1">Explore what other creators have shared.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <Form
          method="get"
          className="space-y-4"
          onSubmit={(event) => {
            if (isSearchDisabled) event.preventDefault();
          }}
        >
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <TextField
                  id="q"
                  label="Search"
                  name="q"
                  type="text"
                  value={queryDraft}
                  onChange={(event) => setQueryDraft(event.target.value)}
                  placeholder="Search title, content, author..."
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isSearchDisabled}>
                  Search
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400">Type at least 3 characters to search.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField id="from" label="From" name="from" type="date" defaultValue={filters.from} />
            <TextField id="to" label="To" name="to" type="date" defaultValue={filters.to} />
            <div>
              <label htmlFor="maxReading" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reading time
              </label>
              <select
                id="maxReading"
                name="maxReading"
                defaultValue={filters.maxReading}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {READING_TIME_BUCKETS.map((bucket) => (
                  <option key={bucket.value} value={bucket.value}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {allCategories.length > 0 && (
            <div>
              <p className="block text-sm font-semibold text-slate-700 mb-1.5">Categories</p>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((category) => (
                  <label key={category.id} className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.name}
                      defaultChecked={filters.categories.includes(category.name)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </Form>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">
            {isQueryTooShort ? 'Type at least 3 characters to search.' : 'No posts match your search.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {items.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} />
      {fetcher.state !== 'idle' && <p className="text-center text-sm text-slate-400 py-2">Loading more…</p>}
    </div>
  );
}
