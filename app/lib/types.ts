import { SocialPlatform } from '../enums/social-platform.enum';
import { UserRole } from '../enums/user-role.enum';
import { OgType } from '../enums/og-type.enum';

export interface UserAvatarEntity {
  id: string;
  url: string;
}

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  age?: number | null;
  role: UserRole;
  posts?: PostEntity[] | null;
  avatar?: UserAvatarEntity | null;
}

export interface CategoryEntity {
  id: string;
  name: string;
  description?: string | null;
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

export interface PostImageEntity {
  id: string;
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
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
  postImage?: PostImageEntity | null;
}

export interface ShareLinks {
  [SocialPlatform.Facebook]: string;
  [SocialPlatform.Twitter]: string;
  [SocialPlatform.LinkedIn]: string;
  [SocialPlatform.Whatsapp]: string;
  [SocialPlatform.Telegram]: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserEntity;
}

export interface ChatMessageUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatRoomEntity {
  id: string;
  name: string;
  description?: string | null;
  isDirect: boolean;
  participants: ChatMessageUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageEntity {
  id: string;
  message: string;
  userId: string;
  user: ChatMessageUser;
  roomId: string;
  createdAt: string;
  isAdminBroadcast?: boolean;
}
