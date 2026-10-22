import { gqlRequest } from '../graphql-client.server';
import {
  AnalyticsPageDocument,
  type AnalyticsPageQuery,
  type CommentPeriodGranularity,
} from '../../graphql/__generated__/graphql';

// Everything the admin dashboard renders - the analytics dashboard plus the four comment stats -
// is one query (five root fields, one round-trip).
export async function analyticsPageQuery(
  token: string,
  granularity: CommentPeriodGranularity,
): Promise<AnalyticsPageQuery> {
  return gqlRequest(AnalyticsPageDocument, { granularity }, token);
}
