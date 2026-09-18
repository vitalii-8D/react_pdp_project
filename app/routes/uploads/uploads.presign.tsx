import { data } from 'react-router';
import { UploadFormField } from '../../enums/upload-form-field.enum';

import type { Route } from './+types/uploads.presign';
import { requireTokenFromContext } from '../../lib/auth.server';
import { generateUploadUrlMutation } from '../../lib/graphql/uploads.server';
import { toActionError } from '../../lib/graphql-client.server';
import { ALLOWED_IMAGE_MIME_TYPES } from '../../lib/upload-constraints';
import { UploadPurpose } from '../../enums/upload-purpose.enum';

const IMAGE_UPLOAD_PURPOSES: UploadPurpose[] = [UploadPurpose.PostImage, UploadPurpose.UserAvatar];

export async function action({ request, context }: Route.ActionArgs) {
  const token = requireTokenFromContext(context);
  const formData = await request.formData();
  const purpose = String(formData.get(UploadFormField.Purpose) ?? '') as UploadPurpose;
  const fileName = String(formData.get(UploadFormField.FileName) ?? '');
  const contentType = String(formData.get(UploadFormField.ContentType) ?? '');

  if (!Object.values(UploadPurpose).includes(purpose)) {
    return data({ error: 'Invalid upload purpose.' }, { status: 400 });
  }

  if (IMAGE_UPLOAD_PURPOSES.includes(purpose) && !ALLOWED_IMAGE_MIME_TYPES.includes(contentType)) {
    return data({ error: 'Unsupported file type.' }, { status: 400 });
  }

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
