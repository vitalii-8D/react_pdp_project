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

export interface CommentsPerPostStat {
  postId: string;
  postTitle: string;
  count: number;
}

export interface CommentsPerUserStat {
  userId: string;
  userName: string;
  count: number;
}

export interface CommentsPerPeriodStat {
  period: string;
  count: number;
}

export interface RatingDistributionStat {
  rating: number;
  count: number;
}

export async function commentsPerPostQuery(token: string): Promise<CommentsPerPostStat[]> {
  const query = gql`
    query CommentsPerPost {
      commentsPerPost {
        postId
        postTitle
        count
      }
    }
  `;
  const data = await gqlRequest<{ commentsPerPost: CommentsPerPostStat[] }>(query, undefined, token);
  return data.commentsPerPost;
}

export async function commentsPerUserQuery(token: string): Promise<CommentsPerUserStat[]> {
  const query = gql`
    query CommentsPerUser {
      commentsPerUser {
        userId
        userName
        count
      }
    }
  `;
  const data = await gqlRequest<{ commentsPerUser: CommentsPerUserStat[] }>(query, undefined, token);
  return data.commentsPerUser;
}

export async function commentsPerPeriodQuery(token: string, granularity: 'DAY' | 'MONTH'): Promise<CommentsPerPeriodStat[]> {
  const query = gql`
    query CommentsPerPeriod($granularity: CommentPeriodGranularity!) {
      commentsPerPeriod(granularity: $granularity) {
        period
        count
      }
    }
  `;
  const data = await gqlRequest<{ commentsPerPeriod: CommentsPerPeriodStat[] }>(query, { granularity }, token);
  return data.commentsPerPeriod;
}

export async function commentRatingDistributionQuery(token: string): Promise<RatingDistributionStat[]> {
  const query = gql`
    query CommentRatingDistribution {
      commentRatingDistribution {
        rating
        count
      }
    }
  `;
  const data = await gqlRequest<{ commentRatingDistribution: RatingDistributionStat[] }>(query, undefined, token);
  return data.commentRatingDistribution;
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
