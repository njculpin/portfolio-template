import type { CheckoutConfig, CheckoutItem } from '../types';

export function useStripeCheckout() {
  return {
    async handleCheckout(items: CheckoutItem[], config: CheckoutConfig) {
      const lineItems = items.map((item) => ({
        stripePriceId: item.providerId,
        quantity: item.quantity,
      }));

      const deployment = config.deployment || 'vercel';
      const checkoutUrl =
        deployment === 'netlify' ? '/.netlify/functions/checkout' : '/api/checkout';

      const res = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lineItems }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    },
  };
}
