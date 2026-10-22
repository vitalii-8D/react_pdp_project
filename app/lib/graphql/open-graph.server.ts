import { gqlRequest } from '../graphql-client.server';
import { GenerateShareLinksDocument } from '../../graphql/__generated__/graphql';
import type { ShareLinks } from '../types';

export async function generateShareLinksQuery(
  token: string | undefined,
  url: string,
  postId?: string,
): Promise<ShareLinks> {
  const data = await gqlRequest(GenerateShareLinksDocument, { url, postId }, token);

  return data.generateShareLinks;
}
