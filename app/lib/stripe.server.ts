export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY ?? '';
}
