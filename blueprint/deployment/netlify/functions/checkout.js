/**
 * Netlify serverless function — POST /.netlify/functions/checkout
 * Creates a Stripe Checkout Session and returns the session ID.
 */
const { createCheckoutSession } = require("../../src/checkout");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { items } = JSON.parse(event.body);
    const origin =
      event.headers.origin || `https://${event.headers.host}`;
    const session = await createCheckoutSession(items, origin);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (err) {
    console.error("Checkout error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create checkout session" }),
    };
  }
};
