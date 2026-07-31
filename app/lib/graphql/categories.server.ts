import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { CategoryEntity } from '../types';

export async function categoriesQuery(token: string): Promise<CategoryEntity[]> {
  const query = gql`
    query Categories {
      categories {
        id
        name
        description
      }
    }
  `;
  const data = await gqlRequest<{ categories: CategoryEntity[] }>(query, undefined, token);
  return data.categories;
}
