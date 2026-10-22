import { gqlRequest } from '../graphql-client.server';
import {
  CreateUserDocument,
  LoginDocument,
  MeDocument,
  SearchUsersDocument,
  UpdateAvatarDocument,
  UpdateUserDocument,
  type CreateUserInput,
  type LoginMutation,
  type SearchUsersQuery,
  type UpdateUserInput,
  type UserAvatarInput,
} from '../../graphql/__generated__/graphql';
import type { CurrentUser, SearchUsersInput, UserAvatarDetails, UserEntity } from '../types';

export type SearchUsersResult = Omit<SearchUsersQuery['searchUsers'], '__typename'>;

// The signed-in user carries the full avatar record (the profile edit form needs key/mime/size to
// keep the current image), so the auth middleware's `me` is the single source of the current user
// and no route has to fetch it again.
export async function meQuery(token: string): Promise<CurrentUser> {
  const data = await gqlRequest(MeDocument, {}, token);

  return data.me;
}

export async function loginMutation(email: string, password: string): Promise<LoginMutation['login']> {
  const data = await gqlRequest(LoginDocument, { loginInput: { email, password } });

  return data.login;
}

export async function searchUsersQuery(token: string, input: SearchUsersInput): Promise<SearchUsersResult> {
  const data = await gqlRequest(SearchUsersDocument, { input }, token);

  return data.searchUsers;
}

export async function createUserMutation(input: CreateUserInput): Promise<void> {
  await gqlRequest(CreateUserDocument, { createUserInput: input });
}

export async function updateUserMutation(token: string, input: UpdateUserInput): Promise<UserEntity> {
  const data = await gqlRequest(UpdateUserDocument, { updateUserInput: input }, token);

  return data.updateUser;
}

export async function updateAvatarMutation(token: string, input: UserAvatarInput): Promise<UserAvatarDetails> {
  const data = await gqlRequest(UpdateAvatarDocument, { input }, token);

  return data.updateAvatar;
}
