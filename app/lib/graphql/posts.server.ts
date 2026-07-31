import { gql } from 'graphql-request';

import { gqlRequest, GqlRequestError } from '../graphql-client.server';
import { categoriesQuery } from './categories.server';
import { PostFormField } from '../../enums/post-form-field.enum';
import type { PostEntity } from '../types';

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
      avatar {
        id
        url
      }
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
    postImage {
      id
      key
      url
      originalFileName
      mimeType
      sizeBytes
      altText
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
  const data = await gqlRequest<{ posts: PostEntity[] }>(query, undefined, token);
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
  const data = await gqlRequest<{ me: { posts: PostEntity[] } }>(query, undefined, token);
  return data.me.posts;
}

export async function postQuery(token: string | undefined, id: string): Promise<PostEntity> {
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
  tags?: string[];
}

export interface PostImageInput {
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
}

export interface ParsedPostFormInput {
  title: string;
  content: string;
  slug: string;
  published: boolean;
  categoryIds: string[];
  metadata?: PostMetadataInput;
  image?: PostImageInput;
}

export async function parsePostFormInput(token: string, formData: FormData): Promise<ParsedPostFormInput> {
  const title = String(formData.get(PostFormField.Title) ?? '');
  const content = String(formData.get(PostFormField.Content) ?? '');
  const slug = String(formData.get(PostFormField.Slug) ?? '');
  const published = formData.get(PostFormField.Published) === 'true';
  const categoryIds = formData.getAll(PostFormField.CategoryIds).map(String);

  const imageKey = String(formData.get(PostFormField.ImageKey) ?? '').trim();
  const imageUrl = String(formData.get(PostFormField.ImageUrl) ?? '').trim();
  const imageMimeType = String(formData.get(PostFormField.ImageMimeType) ?? '').trim();
  const imageSizeBytes = Number(formData.get(PostFormField.ImageSizeBytes) ?? 0);
  const imageOriginalFileName = String(formData.get(PostFormField.ImageOriginalFileName) ?? '').trim();
  const imageAlt = String(formData.get(PostFormField.ImageAlt) ?? '').trim();

  const categories = await categoriesQuery(token);
  const tags = categories
    .filter((category) => categoryIds.includes(category.id))
    .map((category) => category.name.toLowerCase());

  const metadata: PostMetadataInput | undefined = tags.length ? { tags } : undefined;

  const image: PostImageInput | undefined =
    imageKey && imageUrl
      ? {
          key: imageKey,
          url: imageUrl,
          mimeType: imageMimeType,
          sizeBytes: imageSizeBytes,
          originalFileName: imageOriginalFileName,
          ...(imageAlt && { altText: imageAlt }),
        }
      : undefined;

  return { title, content, slug, published, categoryIds, metadata, image };
}

export interface CreatePostInput {
  title: string;
  content: string;
  slug: string;
  published?: boolean;
  categoryIds?: string[];
  metadata?: PostMetadataInput;
  image?: PostImageInput;
}

export async function createPostMutation(token: string, input: CreatePostInput): Promise<PostEntity> {
  const query = gql`
    ${POST_FIELDS}
    mutation CreatePost($createPostInput: CreatePostInput!) {
      createPost(createPostInput: $createPostInput) {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ createPost: PostEntity }>(query, { createPostInput: input }, token);
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
  image?: PostImageInput;
}

export async function updatePostMutation(token: string, input: UpdatePostInput): Promise<PostEntity> {
  const query = gql`
    ${POST_FIELDS}
    mutation UpdatePost($updatePostInput: UpdatePostInput!) {
      updatePost(updatePostInput: $updatePostInput) {
        ...PostFields
      }
    }
  `;
  const data = await gqlRequest<{ updatePost: PostEntity }>(query, { updatePostInput: input }, token);
  return data.updatePost;
}

export async function removePostMutation(token: string, id: string): Promise<void> {
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
      error instanceof GqlRequestError && error.message.includes('Cannot return null for non-nullable field');
    if (!isNullIdSerializationBug) {
      throw error;
    }
  }
}
