import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { UploadPurpose } from '../../enums/upload-purpose.enum';

export interface GenerateUploadUrlInput {
  purpose: UploadPurpose;
  fileName: string;
  contentType: string;
}

export interface PresignedUploadPayload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function generateUploadUrlMutation(
  token: string,
  input: GenerateUploadUrlInput,
): Promise<PresignedUploadPayload> {
  const query = gql`
    mutation GenerateUploadUrl($input: GenerateUploadUrlInput!) {
      generateUploadUrl(input: $input) {
        uploadUrl
        publicUrl
        key
      }
    }
  `;

  const data = await gqlRequest<{ generateUploadUrl: PresignedUploadPayload }>(query, { input }, token);

  return data.generateUploadUrl;
}
