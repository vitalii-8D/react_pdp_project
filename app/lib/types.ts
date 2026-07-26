import { SocialPlatform } from "../enums/social-platform.enum";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  age?: number | null;
  role: UserRole;
  posts?: PostEntity[] | null;
}

export interface CategoryEntity {
  id: string;
  name: string;
  description?: string | null;
}

export enum OgType {
  ARTICLE = "ARTICLE",
  BOOK = "BOOK",
  EVENT = "EVENT",
  MUSIC = "MUSIC",
  PRODUCT = "PRODUCT",
  RECIPE = "RECIPE",
  VIDEO = "VIDEO",
  WEBSITE = "WEBSITE",
}

export interface OpenGraphMetadataEntity {
  id: string;
  postId: string;
  title: string;
  description: string;
  type: OgType;
  image?: string | null;
  imageAlt?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  siteName?: string | null;
  locale?: string | null;
  tags?: string[] | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  author?: string | null;
  publisher?: string | null;
  twitterCard?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
}

export interface PostEntity {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: UserEntity;
  categories?: CategoryEntity[] | null;
  openGraphMetadata?: OpenGraphMetadataEntity | null;
}

export interface ShareLinks {
  [SocialPlatform.Facebook]: string;
  [SocialPlatform.Twitter]: string;
  [SocialPlatform.LinkedIn]: string;
  [SocialPlatform.Whatsapp]: string;
  [SocialPlatform.Telegram]: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserEntity;
}
