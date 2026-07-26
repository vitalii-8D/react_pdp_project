import { useState } from "react";
import { Form, Link } from "react-router";

import { formatSlug } from "../lib/format-slug";
import type { CategoryEntity } from "../lib/types";

interface PostFormMetadataDefaultValues {
  image: string;
  imageAlt: string;
  tags: string;
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

export function PostForm({ categories, defaultValues, error, pending, cancelTo, submitLabel }: PostFormProps) {
  const [slug, setSlug] = useState(defaultValues?.slug ?? formatSlug(defaultValues?.title ?? ""));

  return (
    <Form method="post" className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          onChange={(event) => setSlug(formatSlug(event.target.value))}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(event) => setSlug(formatSlug(event.target.value))}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-400 mt-1">Auto-generated from the title. Used in the post&apos;s URL.</p>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          defaultValue={defaultValues?.content}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="metadataImage" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Image URL
          </label>
          <input
            id="metadataImage"
            name="metadataImage"
            type="url"
            defaultValue={defaultValues?.metadata?.image}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="metadataImageAlt" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Image alt text
          </label>
          <input
            id="metadataImageAlt"
            name="metadataImageAlt"
            type="text"
            defaultValue={defaultValues?.metadata?.imageAlt}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <span className="block text-sm font-semibold text-slate-700 mb-1.5">Categories</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200 has-[:checked]:text-blue-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={defaultValues?.categoryIds?.includes(category.id)}
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
          name="published"
          value="true"
          defaultChecked={defaultValues?.published}
          className="mr-2"
        />
        Published
      </label>

      <details className="rounded-xl border border-slate-200 open:pb-4">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-slate-700">
          Social sharing metadata
        </summary>
        <div className="space-y-4 px-4 pt-1">
          <p className="text-xs text-slate-400">
            Optional. Powers the preview card and Open Graph tags when this post is shared.
          </p>

          <div>
            <label htmlFor="metadataTags" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tags
            </label>
            <input
              id="metadataTags"
              name="metadataTags"
              type="text"
              placeholder="comma, separated, tags"
              defaultValue={defaultValues?.metadata?.tags}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </details>

      <div className="flex items-center justify-end space-x-3 pt-2">
        <Link to={cancelTo} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </Form>
  );
}