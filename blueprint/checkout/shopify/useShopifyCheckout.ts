import type { CheckoutConfig, CheckoutItem } from '../types';

export function useShopifyCheckout() {
  return {
    async handleCheckout(items: CheckoutItem[], _config: CheckoutConfig) {
      const domain = import.meta.env.VITE_SHOPIFY_DOMAIN;
      const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
      if (!domain || !token) {
        console.error('Missing VITE_SHOPIFY_DOMAIN or VITE_SHOPIFY_STOREFRONT_TOKEN');
        return;
      }

      const lineItems = items.map((item) => ({
        variantId: item.providerId,
        quantity: item.quantity,
      }));

      const mutation = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout { webUrl }
            checkoutUserErrors { message }
          }
        }
      `;

      const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              lineItems: lineItems.map((li) => ({
                variantId: btoa(`gid://shopify/ProductVariant/${li.variantId}`),
                quantity: li.quantity,
              })),
            },
          },
        }),
      });

      const data = await res.json();
      const webUrl = data?.data?.checkoutCreate?.checkout?.webUrl;
      if (webUrl) {
        window.location.href = webUrl;
      }
    },
  };
}
