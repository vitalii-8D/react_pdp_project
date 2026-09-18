import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';

import { ChatFormField } from '../enums/chat-form-field.enum';
import { paths } from '../lib/paths';
import type { ChatMessageUser } from '../lib/types';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

interface SearchFetcherData {
  users: ChatMessageUser[];
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
  const startDmFetcher = useFetcher();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchFetcher.load(`${searchAction}?q=${encodeURIComponent(trimmedQuery)}`);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [trimmedQuery]);

  const results = searchFetcher.data?.users ?? [];

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

      {trimmedQuery.length >= MIN_QUERY_LENGTH && (
        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              {searchFetcher.state === 'loading' ? 'Searching...' : 'No users found.'}
            </p>
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
