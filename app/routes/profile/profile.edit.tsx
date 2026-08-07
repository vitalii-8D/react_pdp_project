import { useState } from 'react';
import { redirect, Form, Link, useNavigation } from 'react-router';

import type { Route } from './+types/profile.edit';
import { requireUser } from '../../lib/auth.server';
import { meWithAvatarQuery, updateUserMutation, updateAvatarMutation } from '../../lib/graphql/users.server';
import { toActionError } from '../../lib/graphql-client.server';
import { AuthFormField } from '../../enums/auth-form-field.enum';
import { AvatarFormField } from '../../enums/avatar-form-field.enum';
import { UploadPurpose } from '../../enums/upload-purpose.enum';
import { paths } from '../../lib/paths';
import { cardClassName } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { ImageUploadField } from '../../components/ImageUploadField';
import { Button, buttonStyles } from '../../components/Button';

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireUser(request);
  const user = await meWithAvatarQuery(token);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const { token, user } = await requireUser(request);
  const formData = await request.formData();

  const name = String(formData.get(AuthFormField.Name) ?? '');
  const email = String(formData.get(AuthFormField.Email) ?? '');
  const ageRaw = String(formData.get(AuthFormField.Age) ?? '');
  const age = ageRaw ? Number(ageRaw) : undefined;
  const cityRaw = String(formData.get(AuthFormField.City) ?? '').trim();
  const password = String(formData.get(AuthFormField.Password) ?? '');

  const avatarKey = String(formData.get(AvatarFormField.AvatarKey) ?? '').trim();

  try {
    await updateUserMutation(token, {
      id: user.id,
      name,
      email,
      age,
      city: cityRaw || undefined,
      ...(password ? { password } : {}),
    });

    if (avatarKey) {
      await updateAvatarMutation(token, {
        key: avatarKey,
        url: String(formData.get(AvatarFormField.AvatarUrl) ?? '').trim(),
        mimeType: String(formData.get(AvatarFormField.AvatarMimeType) ?? '').trim(),
        sizeBytes: Number(formData.get(AvatarFormField.AvatarSizeBytes) ?? 0),
        originalFileName: String(formData.get(AvatarFormField.AvatarOriginalFileName) ?? '').trim(),
      });
    }

    return redirect(paths.profile());
  } catch (error) {
    return toActionError(error, 'Could not update your profile.');
  }
}

export default function EditProfile({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { user } = loaderData;
  const pending = navigation.state === 'submitting';
  const [avatarUploading, setAvatarUploading] = useState(false);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Profile</h1>
        <p className="text-slate-500 mt-1">Update your account information.</p>
      </div>

      <Form method="post" className={`${cardClassName} p-6 sm:p-8 space-y-5`}>
        {actionData?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {actionData.error}
          </p>
        )}

        <TextField id="name" label="Name" name={AuthFormField.Name} type="text" required defaultValue={user.name} />

        <TextField
          id="email"
          label="Email"
          name={AuthFormField.Email}
          type="email"
          required
          defaultValue={user.email}
        />

        <TextField id="age" label="Age" name={AuthFormField.Age} type="number" min={0} defaultValue={user.age ?? ''} />

        <TextField
          id="city"
          label="City"
          name={AuthFormField.City}
          type="text"
          defaultValue={user.city ?? ''}
          hint="Used for location-based search when finding other users."
        />

        <TextField
          id="password"
          label="New Password"
          labelSuffix={<span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
          name={AuthFormField.Password}
          type="password"
          autoComplete="new-password"
        />

        <ImageUploadField
          purpose={UploadPurpose.UserAvatar}
          label="Profile photo"
          hint="JPEG, PNG, WebP or GIF, up to 5MB."
          shape="circle"
          fieldNames={{
            key: AvatarFormField.AvatarKey,
            url: AvatarFormField.AvatarUrl,
            mimeType: AvatarFormField.AvatarMimeType,
            sizeBytes: AvatarFormField.AvatarSizeBytes,
            originalFileName: AvatarFormField.AvatarOriginalFileName,
          }}
          defaultValue={
            user.avatar
              ? {
                  key: user.avatar.key,
                  url: user.avatar.url,
                  mimeType: user.avatar.mimeType,
                  sizeBytes: user.avatar.sizeBytes,
                  originalFileName: user.avatar.originalFileName,
                }
              : undefined
          }
          onUploadingChange={setAvatarUploading}
        />

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link to={paths.profile()} className={buttonStyles({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={pending || avatarUploading} size="lg">
            {pending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
