import { gqlRequest } from '../graphql-client.server';
import {
  GenerateUploadUrlDocument,
  type GenerateUploadUrlInput,
  type GenerateUploadUrlMutation,
} from '../../graphql/__generated__/graphql';

export type PresignedUploadPayload = GenerateUploadUrlMutation['generateUploadUrl'];

export async function generateUploadUrlMutation(
  token: string,
  input: GenerateUploadUrlInput,
): Promise<PresignedUploadPayload> {
  const data = await gqlRequest(GenerateUploadUrlDocument, { input }, token);

  return data.generateUploadUrl;
}
