import { Form } from 'react-router';

import type { Route } from './+types/posts';
import { getOptionalUser } from '../../lib/auth.server';
import { searchPostsQuery, type SearchPostsInput } from '../../lib/graphql/posts.server';
import { categoriesQuery } from '../../lib/graphql/categories.server';
import { PostCard } from '../../components/PostCard';
import { Card } from '../../components/Card';
import { Button, buttonStyles } from '../../components/Button';
import { TextField } from '../../components/TextField';

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

export async function loader({ request }: Route.LoaderArgs) {
  const { token, user } = await getOptionalUser(request);
  const params = new URL(request.url).searchParams;

  const q = params.get('q') ?? '';
  const advanced = params.get('advanced') === '1';
  const categories = params.getAll('category');
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const maxReading = params.get('maxReading') ?? '';
  const cursor = params.get('cursor');
  const isCursorValid = Boolean(decodeCursor(cursor));

  const input: SearchPostsInput = {
    ...(q && { query: q, mode: advanced ? 'QUERY_STRING' : 'SIMPLE' }),
    ...(categories.length > 0 && { categories }),
    ...((from || to) && { createdAt: { ...(from && { from }), ...(to && { to }) } }),
    ...(maxReading && { readingTime: { max: Number(maxReading) } }),
    ...(isCursorValid && { cursor: cursor! }),
  };

  const [result, allCategories] = await Promise.all([
    searchPostsQuery(token, input),
    token ? categoriesQuery(token) : Promise.resolve([]),
  ]);

  return {
    result,
    allCategories,
    currentUserId: user?.id,
    filters: { q, advanced, categories, from, to, maxReading },
  };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  const { result, allCategories, currentUserId, filters } = loaderData;
  const facetCountByName = new Map(result.facets.map((facet) => [facet.name, facet.count]));

  const nextCursorParams = new URLSearchParams();
  if (filters.q) nextCursorParams.set('q', filters.q);
  if (filters.advanced) nextCursorParams.set('advanced', '1');
  filters.categories.forEach((category) => nextCursorParams.append('category', category));
  if (filters.from) nextCursorParams.set('from', filters.from);
  if (filters.to) nextCursorParams.set('to', filters.to);
  if (filters.maxReading) nextCursorParams.set('maxReading', filters.maxReading);
  if (result.nextCursor) nextCursorParams.set('cursor', result.nextCursor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Community Posts</h1>
        <p className="text-slate-500 mt-1">Explore what other creators have shared.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <Form method="get" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <TextField
                id="q"
                label="Search"
                name="q"
                type="text"
                defaultValue={filters.q}
                placeholder={filters.advanced ? 'title:react AND -status:archived' : 'Search title, content, author...'}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Search</Button>
            </div>
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
                    {facetCountByName.has(category.name) && (
                      <span className="text-slate-400">({facetCountByName.get(category.name)})</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="advanced"
              value="1"
              defaultChecked={filters.advanced}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Advanced query syntax (e.g. <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">title:react</code>)
          </label>
        </Form>
      </Card>

      {result.items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-400 text-lg">No posts match your search.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {result.items.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {result.nextCursor && (
        <div className="flex justify-center">
          <a href={`?${nextCursorParams.toString()}`} className={buttonStyles({ variant: 'secondary' })}>
            Load more
          </a>
        </div>
      )}
    </div>
  );
}
