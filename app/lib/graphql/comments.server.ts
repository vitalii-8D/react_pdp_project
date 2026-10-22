import { gqlRequest } from '../graphql-client.server';
import {
  CommentsByPostDocument,
  CreateCommentDocument,
  RemoveCommentDocument,
  UpdateCommentDocument,
  type CreateCommentInput,
  type UpdateCommentInput,
} from '../../graphql/__generated__/graphql';
import type { CommentEntity } from '../types';

export async function commentsByPostQuery(postId: string, token?: string): Promise<CommentEntity[]> {
  const data = await gqlRequest(CommentsByPostDocument, { postId }, token);

  return data.commentsByPost;
}

export async function createCommentMutation(token: string, input: CreateCommentInput): Promise<CommentEntity> {
  const data = await gqlRequest(CreateCommentDocument, { createCommentInput: input }, token);

  return data.createComment;
}

export async function updateCommentMutation(token: string, input: UpdateCommentInput): Promise<CommentEntity> {
  const data = await gqlRequest(UpdateCommentDocument, { updateCommentInput: input }, token);

  return data.updateComment;
}

export async function removeCommentMutation(token: string, id: string): Promise<void> {
  await gqlRequest(RemoveCommentDocument, { id }, token);
}
