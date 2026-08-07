import { gql } from 'graphql-request';

import { gqlRequest, GqlRequestError } from '../graphql-client.server';
import type { CommentEntity } from '../types';

const COMMENT_FIELDS = gql`
  fragment CommentFields on CommentEntity {
    id
    content
    rating
    postId
    authorId
    createdAt
    updatedAt
    author {
      id
      name
      avatar {
        id
        url
      }
    }
  }
`;

export async function commentsByPostQuery(postId: string, token?: string): Promise<CommentEntity[]> {
  const query = gql`
    ${COMMENT_FIELDS}
    query CommentsByPost($postId: ID!) {
      commentsByPost(postId: $postId) {
        ...CommentFields
      }
    }
  `;
  const data = await gqlRequest<{ commentsByPost: CommentEntity[] }>(query, { postId }, token);
  return data.commentsByPost;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  rating: number;
}

export async function createCommentMutation(token: string, input: CreateCommentInput): Promise<CommentEntity> {
  const query = gql`
    ${COMMENT_FIELDS}
    mutation CreateComment($createCommentInput: CreateCommentInput!) {
      createComment(createCommentInput: $createCommentInput) {
        ...CommentFields
      }
    }
  `;
  const data = await gqlRequest<{ createComment: CommentEntity }>(query, { createCommentInput: input }, token);
  return data.createComment;
}

export interface UpdateCommentInput {
  id: string;
  content?: string;
  rating?: number;
}

export async function updateCommentMutation(token: string, input: UpdateCommentInput): Promise<CommentEntity> {
  const query = gql`
    ${COMMENT_FIELDS}
    mutation UpdateComment($updateCommentInput: UpdateCommentInput!) {
      updateComment(updateCommentInput: $updateCommentInput) {
        ...CommentFields
      }
    }
  `;
  const data = await gqlRequest<{ updateComment: CommentEntity }>(query, { updateCommentInput: input }, token);
  return data.updateComment;
}

export async function removeCommentMutation(token: string, id: string): Promise<void> {
  const query = gql`
    mutation RemoveComment($id: ID!) {
      removeComment(id: $id) {
        id
      }
    }
  `;
  try {
    await gqlRequest<{ removeComment: { id: string } }>(query, { id }, token);
  } catch (error) {
    // Same TypeORM quirk as removePostMutation: the entity's id is nulled out
    // by repository.remove() before it's serialized as the (non-nullable) return value.
    const isNullIdSerializationBug =
      error instanceof GqlRequestError && error.message.includes('Cannot return null for non-nullable field');
    if (!isNullIdSerializationBug) {
      throw error;
    }
  }
}
