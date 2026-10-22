// Domain names for the generated GraphQL types. The shapes come from the fragments in src/graphql
// (regenerate with `npm run codegen`), so they always match what the queries actually select.
import type {
  AvatarDetailsFragment,
  CategoryFieldsFragment,
  ChatAttachmentFieldsFragment,
  ChatMessageFieldsFragment,
  ChatRoomFieldsFragment,
  CommentFieldsFragment,
  CurrentUserFieldsFragment,
  GenerateShareLinksQuery,
  PostAuthorFragment,
  PostFieldsFragment,
  SearchPostsInput as GeneratedSearchPostsInput,
  SearchUsersInput as GeneratedSearchUsersInput,
  TransactionFieldsFragment,
  UserFieldsFragment,
  UserSummaryFragment,
} from '../graphql/__generated__/graphql';

export type PostEntity = PostFieldsFragment;
export type PostAuthor = PostAuthorFragment;
export type CategoryEntity = CategoryFieldsFragment;
export type CommentEntity = CommentFieldsFragment;
export type UserEntity = UserFieldsFragment;
export type CurrentUser = CurrentUserFieldsFragment;
export type UserAvatarDetails = AvatarDetailsFragment;
export type ChatMessageUser = UserSummaryFragment;
export type ChatRoomEntity = ChatRoomFieldsFragment;
export type ChatMessageEntity = ChatMessageFieldsFragment;
export type ChatAttachmentEntity = ChatAttachmentFieldsFragment;
export type PaymentTransactionEntity = TransactionFieldsFragment;
export type ShareLinks = Omit<GenerateShareLinksQuery['generateShareLinks'], '__typename'>;
export type SearchPostsInput = GeneratedSearchPostsInput;
export type SearchUsersInput = GeneratedSearchUsersInput;
