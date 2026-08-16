/** The slice of a cart item every checkout provider needs. */
export interface CheckoutItem {
  providerId: string;
  quantity: number;
}

/** The slice of portfolio.config.json every checkout provider needs. */
export interface CheckoutConfig {
  deployment?: string;
}

export interface CheckoutHandler {
  handleCheckout: (items: CheckoutItem[], config: CheckoutConfig) => void | Promise<void>;
}
