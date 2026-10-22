import { gqlRequest } from '../graphql-client.server';
import {
  CreatePostDocument,
  IncrementPostViewCountDocument,
  MyPostsDocument,
  PostDocument,
  RemovePostDocument,
  SearchPostsDocument,
  UpdatePostDocument,
  type CreatePostInput,
  type SearchPostsQuery,
  type UpdatePostInput,
} from '../../graphql/__generated__/graphql';
import type { PostEntity, SearchPostsInput } from '../types';

export type SearchPostsResult = Omit<SearchPostsQuery['searchPosts'], '__typename'>;

export async function myPostsQuery(token: string): Promise<PostEntity[]> {
  const data = await gqlRequest(MyPostsDocument, {}, token);

  return data.me.posts ?? [];
}

export async function postQuery(token: string | undefined, id: string): Promise<PostEntity> {
  const data = await gqlRequest(PostDocument, { id }, token);

  return data.post;
}

export async function searchPostsQuery(token: string | undefined, input: SearchPostsInput): Promise<SearchPostsResult> {
  const data = await gqlRequest(SearchPostsDocument, { input }, token);

  return data.searchPosts;
}

export async function createPostMutation(token: string, input: CreatePostInput): Promise<PostEntity> {
  const data = await gqlRequest(CreatePostDocument, { createPostInput: input }, token);

  return data.createPost;
}

export async function updatePostMutation(token: string, input: UpdatePostInput): Promise<PostEntity> {
  const data = await gqlRequest(UpdatePostDocument, { updatePostInput: input }, token);

  return data.updatePost;
}

export async function removePostMutation(token: string, id: string): Promise<void> {
  await gqlRequest(RemovePostDocument, { id }, token);
}

export async function incrementPostViewCountMutation(id: string): Promise<void> {
  await gqlRequest(IncrementPostViewCountDocument, { id });
}
