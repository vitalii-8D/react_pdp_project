import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';

export interface DateCountPoint {
  date: string;
  count: number;
}

export interface RoleBreakdownPoint {
  role: string;
  online: number;
  offline: number;
}

export interface TermCount {
  term: string;
  count: number;
}

export interface GeoCluster {
  geohash: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface TopRatedPost {
  postId: string;
  postTitle: string;
  averageRating: number;
  ratingCount: number;
}

export interface CommentVelocityPoint {
  date: string;
  count: number;
  dailyChange?: number | null;
}

export interface CommenterSentiment {
  userId: string;
  userName: string;
  positiveCount: number;
  criticalCount: number;
}

export interface SignificantTerm {
  term: string;
  score: number;
  docCount: number;
}

export interface AnalyticsDashboard {
  userGrowth: DateCountPoint[];
  roleBreakdown: RoleBreakdownPoint[];
  topCities: TermCount[];
  geoClusters: GeoCluster[];
  topRatedPosts: TopRatedPost[];
  commentVelocity: CommentVelocityPoint[];
  commenterSentiment: CommenterSentiment[];
  negativeCommentTerms: SignificantTerm[];
}

export async function analyticsDashboardQuery(token: string): Promise<AnalyticsDashboard> {
  const query = gql`
    query AnalyticsDashboard {
      analyticsDashboard {
        userGrowth {
          date
          count
        }
        roleBreakdown {
          role
          online
          offline
        }
        topCities {
          term
          count
        }
        geoClusters {
          geohash
          latitude
          longitude
          count
        }
        topRatedPosts {
          postId
          postTitle
          averageRating
          ratingCount
        }
        commentVelocity {
          date
          count
          dailyChange
        }
        commenterSentiment {
          userId
          userName
          positiveCount
          criticalCount
        }
        negativeCommentTerms {
          term
          score
          docCount
        }
      }
    }
  `;

  const data = await gqlRequest<{ analyticsDashboard: AnalyticsDashboard }>(query, undefined, token);
  return data.analyticsDashboard;
}
