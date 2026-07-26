import type { PostMetadataInput } from "./graphql/posts.server";

export function readMetadata(formData: FormData): PostMetadataInput | undefined {
  const image = String(formData.get("metadataImage") ?? "").trim();
  const imageAlt = String(formData.get("metadataImageAlt") ?? "").trim();
  const tags = String(formData.get("metadataTags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const hasAnyValue = Boolean(image || imageAlt || tags.length);
  if (!hasAnyValue) {
    return undefined;
  }

  return {
    ...(image && { image }),
    ...(imageAlt && { imageAlt }),
    ...(tags.length && { tags }),
  };
}