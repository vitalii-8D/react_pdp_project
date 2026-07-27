import {
  MetaProperty,
  MetaName,
  TwitterCardType,
} from "../enums/meta-tag.enum";
import type { PostEntity } from "./types";

export function buildOgMetaTags(
  post: PostEntity,
  url: string,
): Array<Record<string, string>> {
  const og = post.openGraphMetadata;
  const title = og?.title ?? post.title;
  const description = og?.description ?? post.content.slice(0, 160);

  const tags: Array<Record<string, string>> = [
    { title },
    { name: MetaName.Description, content: description },
    { property: MetaProperty.OgTitle, content: title },
    { property: MetaProperty.OgDescription, content: description },
    { property: MetaProperty.OgType, content: "article" },
    { property: MetaProperty.OgUrl, content: url },
  ];

  if (og?.image) {
    tags.push({ property: MetaProperty.OgImage, content: og.image });
    if (og.imageAlt) {
      tags.push({ property: MetaProperty.OgImageAlt, content: og.imageAlt });
    }
  }

  if (og?.siteName) {
    tags.push({ property: MetaProperty.OgSiteName, content: og.siteName });
  }

  tags.push({
    name: MetaName.TwitterCard,
    content: og?.image
      ? TwitterCardType.SummaryLargeImage
      : TwitterCardType.Summary,
  });
  tags.push({ name: MetaName.TwitterTitle, content: title });
  tags.push({ name: MetaName.TwitterDescription, content: description });
  if (og?.image) {
    tags.push({ name: MetaName.TwitterImage, content: og.image });
  }

  return tags;
}
