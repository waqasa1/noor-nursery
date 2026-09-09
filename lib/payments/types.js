/**
 * @typedef {Object} PaymentProvider
 * @property {string} id
 * @property {string} labelEn
 * @property {string} labelUr
 * @property {string} descriptionEn
 * @property {string} descriptionUr
 * @property {(ctx: { order: import('@/models/Order').default }) => Promise<PaymentInitResult>} initiate
 * @property {(payload: Record<string, string>) => Promise<PaymentCallbackResult>} handleCallback
 * @property {(payload: Record<string, string>) => Promise<PaymentVerifyResult>} verifyPayment
 */

/**
 * @typedef {Object} PaymentInitResult
 * @property {boolean} success
 * @property {string} [paymentStatus]
 * @property {string} [orderStatus]
 * @property {string} [redirectUrl]
 * @property {string} [formAction]
 * @property {Record<string, string>} [formParams]
 * @property {string} [message]
 * @property {string} [error]
 * @property {Object} [bankDetails]
 */

/**
 * @typedef {Object} PaymentCallbackResult
 * @property {boolean} success
 * @property {boolean} [verified]
 * @property {string} [paymentStatus]
 * @property {string} [orderStatus]
 * @property {string} [reference]
 * @property {string} [orderNumber]
 * @property {string} [error]
 * @property {boolean} [requiresManualReview]
 */

/** @typedef {PaymentCallbackResult} PaymentVerifyResult */

export {};
