import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { ChatFormField } from '../enums/chat-form-field.enum';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { paths } from '../lib/paths';
import { MIN_QUERY_LENGTH } from '../lib/search-constants';
import type { UserEntity } from '../lib/types';

const DEBOUNCE_MS = 300;

interface SearchFetcherData {
  query: string;
  users: UserEntity[];
  error?: string;
}

interface UserSearchProps {
  searchAction?: string;
  startDmAction?: string;
}

export function UserSearch({
  searchAction = paths.chatUsersSearch(),
  startDmAction = paths.chatStartDm(),
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const searchFetcher = useFetcher<SearchFetcherData>();
  const startDmFetcher = useFetcher<{ error?: string }>();

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, DEBOUNCE_MS);
  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (canSearch) {
      searchFetcher.load(`${searchAction}?q=${encodeURIComponent(debouncedQuery)}`);
    }
    // fetcher identity changes every render by design; only re-run when the query settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // `searchFetcher.data` outlives the query it was loaded for - only show it while it still matches
  // what is typed, so typing a new query never flashes a stale list.
  const isCurrent = canSearch && debouncedQuery === trimmedQuery && searchFetcher.data?.query === trimmedQuery;
  const results = isCurrent ? (searchFetcher.data?.users ?? []) : [];
  const isSearching = searchFetcher.state === 'loading' || debouncedQuery !== trimmedQuery;
  const error = (isCurrent ? searchFetcher.data?.error : undefined) ?? startDmFetcher.data?.error;

  function handleSelect(userId: string) {
    startDmFetcher.submit({ [ChatFormField.UserId]: userId }, { method: 'post', action: startDmAction });
  }

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users to message (type at least 3 letters)..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {trimmedQuery.length >= MIN_QUERY_LENGTH && (
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">{isSearching ? 'Searching...' : 'No users found.'}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    disabled={startDmFetcher.state !== 'idle'}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    <span className="font-semibold text-slate-800">{user.name}</span>
                    <span className="text-slate-400 ml-2">{user.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
