/**
 * Vercel serverless function — POST /api/checkout
 * Creates a Stripe Checkout Session and returns the session ID.
 */
const { createCheckoutSession } = require("../src/checkout");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await createCheckoutSession(items, origin);
    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
