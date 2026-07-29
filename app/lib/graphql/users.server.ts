import { gql } from "graphql-request";

import { gqlRequest } from "../graphql-client.server";
import type { AuthResponse, ChatMessageUser, UserEntity } from "../types";

const USER_FIELDS = gql`
  fragment UserFields on UserEntity {
    id
    email
    name
    age
    role
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

export async function loginMutation(
  email: string,
  password: string,
): Promise<AuthResponse> {
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

export async function searchUsersQuery(
  token: string,
  query: string,
): Promise<ChatMessageUser[]> {
  const gqlQuery = gql`
    query SearchUsers($query: String!) {
      searchUsers(query: $query) {
        id
        name
        email
      }
    }
  `;

  const data = await gqlRequest<{ searchUsers: ChatMessageUser[] }>(
    gqlQuery,
    { query },
    token,
  );

  return data.searchUsers;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  age?: number;
}

export async function createUserMutation(
  input: CreateUserInput,
): Promise<UserEntity> {
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
}

export async function updateUserMutation(
  token: string,
  input: UpdateUserInput,
): Promise<UserEntity> {
  const query = gql`
    ${USER_FIELDS}
    mutation UpdateUser($updateUserInput: UpdateUserInput!) {
      updateUser(updateUserInput: $updateUserInput) {
        ...UserFields
      }
    }
  `;

  const data = await gqlRequest<{ updateUser: UserEntity }>(
    query,
    { updateUserInput: input },
    token,
  );

  return data.updateUser;
}
