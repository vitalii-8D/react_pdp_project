import { data } from 'react-router';
import { UploadFormField } from '../../enums/upload-form-field.enum';

import type { Route } from './+types/uploads.presign';
import { requireToken } from '../../lib/auth.server';
import { generateUploadUrlMutation } from '../../lib/graphql/uploads.server';
import { toActionError } from '../../lib/graphql-client.server';
import type { UploadPurpose } from '../../enums/upload-purpose.enum';

export async function action({ request }: Route.ActionArgs) {
  const token = await requireToken(request);
  const formData = await request.formData();
  const purpose = String(formData.get(UploadFormField.Purpose) ?? '') as UploadPurpose;
  const fileName = String(formData.get(UploadFormField.FileName) ?? '');
  const contentType = String(formData.get(UploadFormField.ContentType) ?? '');

  try {
    const payload = await generateUploadUrlMutation(token, {
      purpose,
      fileName,
      contentType,
    });
    return data(payload);
  } catch (error) {
    return toActionError(error, 'Could not prepare the upload.');
  }
}
