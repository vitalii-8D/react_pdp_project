import { createContext } from 'react-router';

import type { UserEntity } from './types';

export interface AuthContextValue {
  token?: string;
  user?: UserEntity;
  // Set when the session cookie carried a token the backend rejected (401) - lets
  // `requireUserFromContext` clear the stale cookie on redirect, same as the old
  // per-route `requireUser` did, without every loader re-validating the token itself.
  invalidSession?: boolean;
}

export const authContext = createContext<AuthContextValue>({});
