import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { AuthResponse, ChatMessageUser, UserEntity } from '../types';

const USER_FIELDS = gql`
  fragment UserFields on UserEntity {
    id
    email
    name
    age
    role
    city
    isOnline
    createdAt
    avatar {
      id
      url
    }
  }
`;

export async function meQuery(token: string): Promise<UserEntity> {
  const query = gql`
    ${USER_FIELDS}
    query Me {
      me {
        ...UserFields
      }
    }
  `;

  const data = await gqlRequest<{ me: UserEntity }>(query, undefined, token);

  return data.me;
}

export interface UserAvatarDetails {
  id: string;
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

export async function meWithAvatarQuery(token: string): Promise<UserEntity & { avatar?: UserAvatarDetails | null }> {
  const query = gql`
    ${USER_FIELDS}
    query MeWithAvatar {
      me {
        ...UserFields
        avatar {
          id
          key
          url
          originalFileName
          mimeType
          sizeBytes
        }
      }
    }
  `;

  const data = await gqlRequest<{
    me: UserEntity & { avatar?: UserAvatarDetails | null };
  }>(query, undefined, token);

  return data.me;
}

export async function loginMutation(email: string, password: string): Promise<AuthResponse> {
  const query = gql`
    ${USER_FIELDS}
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        user {
          ...UserFields
        }
      }
    }
  `;

  const data = await gqlRequest<{ login: AuthResponse }>(query, {
    loginInput: { email, password },
  });

  return data.login;
}

export async function usersQuery(token: string): Promise<UserEntity[]> {
  const query = gql`
    ${USER_FIELDS}
    query Users {
      users {
        ...UserFields
      }
    }
  `;

  const data = await gqlRequest<{ users: UserEntity[] }>(query, undefined, token);

  return data.users;
}

export async function searchUsersQuery(token: string, query: string): Promise<ChatMessageUser[]> {
  const gqlQuery = gql`
    query SearchUsers($query: String!) {
      searchUsers(query: $query) {
        id
        name
        email
      }
    }
  `;

  const data = await gqlRequest<{ searchUsers: ChatMessageUser[] }>(gqlQuery, { query }, token);

  return data.searchUsers;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  age?: number;
}

export async function createUserMutation(input: CreateUserInput): Promise<UserEntity> {
  const query = gql`
    ${USER_FIELDS}
    mutation CreateUser($createUserInput: CreateUserInput!) {
      createUser(createUserInput: $createUserInput) {
        ...UserFields
      }
    }
  `;

  const data = await gqlRequest<{ createUser: UserEntity }>(query, {
    createUserInput: input,
  });

  return data.createUser;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  city?: string;
}

export async function updateUserMutation(token: string, input: UpdateUserInput): Promise<UserEntity> {
  const query = gql`
    ${USER_FIELDS}
    mutation UpdateUser($updateUserInput: UpdateUserInput!) {
      updateUser(updateUserInput: $updateUserInput) {
        ...UserFields
      }
    }
  `;

  const data = await gqlRequest<{ updateUser: UserEntity }>(query, { updateUserInput: input }, token);

  return data.updateUser;
}

export interface UserAvatarInput {
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

export async function updateAvatarMutation(token: string, input: UserAvatarInput): Promise<UserAvatarDetails> {
  const query = gql`
    mutation UpdateAvatar($input: UserAvatarInput!) {
      updateAvatar(input: $input) {
        id
        key
        url
        originalFileName
        mimeType
        sizeBytes
      }
    }
  `;

  const data = await gqlRequest<{ updateAvatar: UserAvatarDetails }>(query, { input }, token);

  return data.updateAvatar;
}
