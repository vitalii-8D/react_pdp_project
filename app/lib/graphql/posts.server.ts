import { gql } from "graphql-request";

import { gqlRequest, GqlRequestError } from "../graphql-client.server";
import type { PostEntity } from "../types";

const POST_FIELDS = gql`
  fragment PostFields on PostEntity {
    id
    title
    content
    slug
    published
    createdAt
    updatedAt
    authorId
    author {
      id
      name
      email
    }
    categories {
      id
      name
    }
    openGraphMetadata {
      id
      title
      description
      image
      imageAlt
      author
      siteName
      tags
      publishedTime
    }
  }
`;

export async function postsQuery(token?: string): Promise<PostEntity[]> {
  const query = gql`
    ${POST_FIELDS}
    query Posts {
      posts {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ posts: PostEntity[] }>(
    query,
    undefined,
    token,
  );
  return data.posts;
}

export async function myPostsQuery(token: string): Promise<PostEntity[]> {
  const query = gql`
    ${POST_FIELDS}
    query MyPosts {
      me {
        posts {
          ...PostFields
        }
      }
    }
  `;
  const data = await gqlRequest<{ me: { posts: PostEntity[] } }>(
    query,
    undefined,
    token,
  );
  return data.me.posts;
}

export async function postQuery(
  token: string | undefined,
  id: string,
): Promise<PostEntity> {
  const query = gql`
    ${POST_FIELDS}
    query Post($id: ID!) {
      post(id: $id) {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ post: PostEntity }>(query, { id }, token);
  return data.post;
}

export interface PostMetadataInput {
  image?: string;
  imageAlt?: string;
  tags?: string[];
}

export interface CreatePostInput {
  title: string;
  content: string;
  slug: string;
  published?: boolean;
  categoryIds?: string[];
  metadata?: PostMetadataInput;
}

export async function createPostMutation(
  token: string,
  input: CreatePostInput,
): Promise<PostEntity> {
  const query = gql`
    ${POST_FIELDS}
    mutation CreatePost($createPostInput: CreatePostInput!) {
      createPost(createPostInput: $createPostInput) {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ createPost: PostEntity }>(
    query,
    { createPostInput: input },
    token,
  );
  return data.createPost;
}

export interface UpdatePostInput {
  id: string;
  title?: string;
  content?: string;
  slug?: string;
  published?: boolean;
  categoryIds?: string[];
  metadata?: PostMetadataInput;
}

export async function updatePostMutation(
  token: string,
  input: UpdatePostInput,
): Promise<PostEntity> {
  const query = gql`
    ${POST_FIELDS}
    mutation UpdatePost($updatePostInput: UpdatePostInput!) {
      updatePost(updatePostInput: $updatePostInput) {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ updatePost: PostEntity }>(
    query,
    { updatePostInput: input },
    token,
  );
  return data.updatePost;
}

export async function removePostMutation(
  token: string,
  id: string,
): Promise<void> {
  const query = gql`
    mutation RemovePost($id: ID!) {
      removePost(id: $id) {
        id
      }
    }
  `;
  try {
    await gqlRequest<{ removePost: { id: string } }>(query, { id }, token);
  } catch (error) {
    // BE quirk: PostsService.remove() returns the entity after TypeORM's
    // repository.remove() has already nulled out its @PrimaryGeneratedColumn,
    // so serializing the non-nullable `id` field throws even though the row
    // was deleted. The delete already happened by the time this fires.
    const isNullIdSerializationBug =
      error instanceof GqlRequestError &&
      error.message.includes("Cannot return null for non-nullable field");
    if (!isNullIdSerializationBug) {
      throw error;
    }
  }
}
