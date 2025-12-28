import crypto from "crypto";

interface SignOfferResult {
  payload: string; // JSON string for frontend to store
  signature: string; // HMAC hex digest
  timestamp: number;
}

/**
 * Creates a signed payload for a discounted offer.
 * Uses a canonicalized string format for signing to ensure determinism across environments.
 * 
 * @param variantId The product variant ID being discounted
 * @param finalPrice The negotiated final price
 * @param secretKey The merchant's HMAC secret key
 * @returns Object containing the JSON payload and the HMAC signature
 */
export function signOffer(
  variantId: string,
  finalPrice: number,
  secretKey: string
): SignOfferResult {
  const timestamp = Date.now();
  // Hard-code max quantity to 1 for MVP security (Anti-Arbitrage)
  const maxQty = 1; 

  // Canonical String Format:
  // v={variantId}|p={price}|t={timestamp}|q={maxQty}
  // This avoids JSON determinism issues.
  const canonicalString = `v=${variantId}|p=${finalPrice}|t=${timestamp}|q=${maxQty}`;
  
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(canonicalString)
    .digest("hex");

  // We still return a JSON object for the frontend to easily read and store in attributes,
  // but the 'signature' is valid ONLY for the canonical string, NOT the JSON string.
  // The Function must reconstruct the canonical string from these values to verify.
  const payloadObj = {
    variantId,
    price: finalPrice,
    timestamp,
    maxQty
  };

  return {
    payload: JSON.stringify(payloadObj),
    signature,
    timestamp
  };
}

/**
 * Verifies a signature using the canonical string method.
 */
export function verifySignature(
  payloadObj: { variantId: string; price: number; timestamp: number; maxQty: number },
  signature: string,
  secretKey: string
): boolean {
  const canonicalString = `v=${payloadObj.variantId}|p=${payloadObj.price}|t=${payloadObj.timestamp}|q=${payloadObj.maxQty}`;

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(canonicalString)
    .digest("hex");
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
