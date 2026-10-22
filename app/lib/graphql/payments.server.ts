import { gqlRequest } from '../graphql-client.server';
import {
  MyTransactionsDocument,
  PublishPostDocument,
  RefundPaymentDocument,
  RetryPostPaymentDocument,
  TransactionsForPostDocument,
  type PublishPostResultFieldsFragment,
} from '../../graphql/__generated__/graphql';
import type { PaymentTransactionEntity } from '../types';

export type PublishPostResult = PublishPostResultFieldsFragment;

export async function publishPostMutation(token: string, postId: string): Promise<PublishPostResult> {
  const data = await gqlRequest(PublishPostDocument, { postId }, token);

  return data.publishPost;
}

export async function retryPostPaymentMutation(token: string, postId: string): Promise<PublishPostResult> {
  const data = await gqlRequest(RetryPostPaymentDocument, { postId }, token);

  return data.retryPostPayment;
}

export async function refundPaymentMutation(token: string, transactionId: string): Promise<PaymentTransactionEntity> {
  const data = await gqlRequest(RefundPaymentDocument, { transactionId }, token);

  return data.refundPayment;
}

export async function myTransactionsQuery(token: string): Promise<PaymentTransactionEntity[]> {
  const data = await gqlRequest(MyTransactionsDocument, {}, token);

  return data.myTransactions;
}

export async function transactionsForPostQuery(token: string, postId: string): Promise<PaymentTransactionEntity[]> {
  const data = await gqlRequest(TransactionsForPostDocument, { postId }, token);

  return data.transactionsForPost;
}
