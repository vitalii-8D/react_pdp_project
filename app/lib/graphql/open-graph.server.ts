import { gql } from 'graphql-request';
import { SocialPlatform } from '../../enums/social-platform.enum';

import { gqlRequest } from '../graphql-client.server';
import type { ShareLinks } from '../types';

export async function generateShareLinksQuery(
  token: string | undefined,
  url: string,
  postId?: string,
): Promise<ShareLinks> {
  const query = gql`
    query GenerateShareLinks($url: String!, $postId: ID) {
      generateShareLinks(url: $url, postId: $postId) {
        ${SocialPlatform.Facebook}
        ${SocialPlatform.Twitter}
        ${SocialPlatform.LinkedIn}
        ${SocialPlatform.Telegram}
        ${SocialPlatform.Whatsapp}
      }
    }
  `;
  const data = await gqlRequest<{ generateShareLinks: ShareLinks }>(query, { url, postId }, token);
  return data.generateShareLinks;
}
