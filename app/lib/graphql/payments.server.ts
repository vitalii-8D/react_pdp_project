import { gql } from 'graphql-request';

import { gqlRequest } from '../graphql-client.server';
import type { PaymentTransactionEntity, PostEntity } from '../types';

const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on PaymentTransactionEntity {
    id
    status
    amount
    currency
    stripePaymentIntentId
    failureReason
    refundedAt
    createdAt
    updatedAt
    post {
      id
      title
      slug
    }
  }
`;

export interface PublishPostResult {
  post?: Pick<PostEntity, 'id' | 'status' | 'paymentStatus' | 'hasBeenPublished'> | null;
  checkoutUrl?: string | null;
  checkoutSessionId?: string | null;
}

export async function publishPostMutation(token: string, postId: string): Promise<PublishPostResult> {
  const query = gql`
    mutation PublishPost($postId: ID!) {
      publishPost(postId: $postId) {
        checkoutUrl
        checkoutSessionId
        post {
          id
          status
          paymentStatus
          hasBeenPublished
        }
      }
    }
  `;
  const data = await gqlRequest<{ publishPost: PublishPostResult }>(query, { postId }, token);
  return data.publishPost;
}

export async function retryPostPaymentMutation(token: string, postId: string): Promise<PublishPostResult> {
  const query = gql`
    mutation RetryPostPayment($postId: ID!) {
      retryPostPayment(postId: $postId) {
        checkoutUrl
        checkoutSessionId
        post {
          id
          status
          paymentStatus
          hasBeenPublished
        }
      }
    }
  `;
  const data = await gqlRequest<{ retryPostPayment: PublishPostResult }>(query, { postId }, token);
  return data.retryPostPayment;
}

export async function refundPaymentMutation(token: string, transactionId: string): Promise<PaymentTransactionEntity> {
  const query = gql`
    ${TRANSACTION_FIELDS}
    mutation RefundPayment($transactionId: ID!) {
      refundPayment(transactionId: $transactionId) {
        ...TransactionFields
      }
    }
  `;
  const data = await gqlRequest<{ refundPayment: PaymentTransactionEntity }>(query, { transactionId }, token);
  return data.refundPayment;
}

export async function myTransactionsQuery(token: string): Promise<PaymentTransactionEntity[]> {
  const query = gql`
    ${TRANSACTION_FIELDS}
    query MyTransactions {
      myTransactions {
        ...TransactionFields
      }
    }
  `;
  const data = await gqlRequest<{ myTransactions: PaymentTransactionEntity[] }>(query, undefined, token);
  return data.myTransactions;
}

export async function transactionsForPostQuery(token: string, postId: string): Promise<PaymentTransactionEntity[]> {
  const query = gql`
    ${TRANSACTION_FIELDS}
    query TransactionsForPost($postId: ID!) {
      transactionsForPost(postId: $postId) {
        ...TransactionFields
      }
    }
  `;
  const data = await gqlRequest<{ transactionsForPost: PaymentTransactionEntity[] }>(query, { postId }, token);
  return data.transactionsForPost;
}
