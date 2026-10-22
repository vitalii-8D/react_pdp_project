import { gqlRequest } from '../graphql-client.server';
import { CategoriesDocument } from '../../graphql/__generated__/graphql';
import type { CategoryEntity } from '../types';

export async function categoriesQuery(token?: string): Promise<CategoryEntity[]> {
  const data = await gqlRequest(CategoriesDocument, {}, token);

  return data.categories;
}
