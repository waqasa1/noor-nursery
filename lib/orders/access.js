import { randomBytes } from "node:crypto";

/** Unguessable token for order-success / payment-proof links. */
export function generateOrderAccessToken() {
  return randomBytes(24).toString("base64url");
}

export function orderSuccessPath(orderNumber, accessToken, extraQuery = {}) {
  const params = new URLSearchParams({ t: accessToken, ...extraQuery });
  return `/order-success/${orderNumber}?${params.toString()}`;
}

/** Verify access token for an order document (legacy orders without token: deny tokenless deep links). */
export function orderAccessAllowed(order, token) {
  if (!order) return false;
  if (!order.accessToken) return false;
  return Boolean(token) && token === order.accessToken;
}
