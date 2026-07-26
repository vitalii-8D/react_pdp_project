import { useState } from "react";
import { Form, Link } from "react-router";

import { formatSlug } from "../lib/format-slug";
import { PostFormField } from "../enums/post-form-field.enum";
import { cardClassName } from "./Card";
import { TextField } from "./TextField";
import { Button, buttonStyles } from "./Button";
import type { CategoryEntity } from "../lib/types";

interface PostFormMetadataDefaultValues {
  image: string;
  imageAlt: string;
}

interface PostFormDefaultValues {
  title: string;
  content: string;
  slug: string;
  published: boolean;
  categoryIds: string[];
  metadata: Partial<PostFormMetadataDefaultValues>;
}

interface PostFormProps {
  categories: CategoryEntity[];
  defaultValues?: Partial<PostFormDefaultValues>;
  error?: string;
  pending?: boolean;
  cancelTo: string;
  submitLabel: string;
}

export function PostForm({
  categories,
  defaultValues,
  error,
  pending,
  cancelTo,
  submitLabel,
}: PostFormProps) {
  const [slug, setSlug] = useState(
    defaultValues?.slug ?? formatSlug(defaultValues?.title ?? ""),
  );

  return (
    <Form method="post" className={`${cardClassName} p-6 sm:p-8 space-y-5`}>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <TextField
        id="title"
        label="Title"
        name={PostFormField.Title}
        type="text"
        required
        defaultValue={defaultValues?.title}
        onChange={(event) => setSlug(formatSlug(event.target.value))}
      />

      <TextField
        id="slug"
        label="Slug"
        name={PostFormField.Slug}
        type="text"
        required
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        className="font-mono"
        hint="Auto-generated from the title. Used in the post's URL."
      />

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Content
        </label>
        <textarea
          id="content"
          name={PostFormField.Content}
          required
          rows={6}
          defaultValue={defaultValues?.content}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          id="image"
          label="Image URL"
          name={PostFormField.Image}
          type="url"
          defaultValue={defaultValues?.metadata?.image}
        />
        <TextField
          id="imageAlt"
          label="Image alt text"
          name={PostFormField.ImageAlt}
          type="text"
          defaultValue={defaultValues?.metadata?.imageAlt}
        />
      </div>

      {categories.length > 0 && (
        <div>
          <span className="block text-sm font-semibold text-slate-700 mb-1.5">
            Categories
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200 has-[:checked]:text-blue-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  name={PostFormField.CategoryIds}
                  value={category.id}
                  defaultChecked={defaultValues?.categoryIds?.includes(
                    category.id,
                  )}
                  className="mr-2"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          name={PostFormField.Published}
          value="true"
          defaultChecked={defaultValues?.published}
          className="mr-2"
        />
        Published
      </label>

      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link to={cancelTo} className={buttonStyles({ variant: "secondary" })}>
          Cancel
        </Link>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
