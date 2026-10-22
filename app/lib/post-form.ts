import { PostFormField } from '../enums/post-form-field.enum';
import { PostStatus } from '../enums/post-status.enum';
import type { CreatePostInput, PostImageInput } from '../graphql/__generated__/graphql';
import type { CategoryEntity } from './types';

export type ParsedPostFormInput = CreatePostInput & { status: PostStatus; categoryIds: string[] };

// `allCategories` is the list the form was rendered with - it maps the selected ids to tag names
// without another round-trip on the submit path.
export function parsePostFormInput(formData: FormData, allCategories: CategoryEntity[]): ParsedPostFormInput {
  const title = String(formData.get(PostFormField.Title) ?? '');
  const content = String(formData.get(PostFormField.Content) ?? '');
  const slug = String(formData.get(PostFormField.Slug) ?? '');
  const status = (formData.get(PostFormField.Status) as PostStatus) ?? PostStatus.Draft;
  const categoryIds = formData.getAll(PostFormField.CategoryIds).map(String);

  // The uploaded image's public URL stays in the form only for the preview - the API derives it
  // from the S3 key, and `PostImageInput` has no `url` field.
  const imageKey = formData.get(PostFormField.ImageKey);
  const image: PostImageInput | undefined = imageKey
    ? {
        key: String(imageKey),
        originalFileName: String(formData.get(PostFormField.ImageOriginalFileName) ?? ''),
        mimeType: String(formData.get(PostFormField.ImageMimeType) ?? ''),
        sizeBytes: Number(formData.get(PostFormField.ImageSizeBytes) ?? 0),
        altText: formData.get(PostFormField.ImageAlt) ? String(formData.get(PostFormField.ImageAlt)) : undefined,
      }
    : undefined;

  let metadata: { tags: string[] } | undefined;
  if (categoryIds.length > 0) {
    const selectedIds = new Set(categoryIds);
    const tags = allCategories
      .filter((category) => selectedIds.has(category.id))
      .map((category) => category.name.toLowerCase());
    metadata = { tags };
  }

  return { title, content, slug, status, categoryIds, metadata, image };
}
