// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

// Placeholder for bundled crypto-js. In production build, Javy bundles this.
// import HmacSHA256 from 'crypto-js/hmac-sha256';
// import Hex from 'crypto-js/enc-hex';

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const secretKey = input.shop.metafield?.value;

  if (!secretKey) {
    return { operations: [] };
  }

  const operations = input.cart.lines.reduce((ops, line) => {
    const priceAttr = line.attribute?.value;
    const signatureAttr = line.signature?.value;
    const variantId = line.merchandise.id;

    if (priceAttr && signatureAttr && variantId) {
      try {
        const payloadObj = JSON.parse(priceAttr);
        
        // 1. Validate Payload Matches Line Item
        if (payloadObj.variantId !== variantId) {
            return ops; 
        }

        // 2. Validate Timestamp (15 mins TTL)
        const now = Date.now();
        if (now - payloadObj.timestamp > 15 * 60 * 1000) {
            return ops;
        }

        // 3. Validate Quantity (Anti-Arbitrage)
        // Ensure user hasn't added 500 items when deal was for 1
        const maxQty = payloadObj.maxQty || 1;
        if (line.quantity > maxQty) {
            // Option: Reject deal completely OR cap the discount to maxQty items?
            // For Cart Transform, we can split the line, but simpler to just invalid the deal for now.
            // "You negotiated for 1 item, not 50."
            return ops;
        }

        // 4. Canonical String Reconstruction for Verification
        // v={variantId}|p={price}|t={timestamp}|q={maxQty}
        const canonicalString = `v=${payloadObj.variantId}|p=${payloadObj.price}|t=${payloadObj.timestamp}|q=${maxQty}`;

        // 5. Verify Signature (Using Placeholder Logic)
        // const calculatedSignature = HmacSHA256(canonicalString, secretKey).toString(Hex);
        
        // Mocking check for Javy without bundle in this environment
        const isValid = true; // REPLACE: calculatedSignature === signatureAttr

        if (isValid) {
          ops.push({
            update: {
              cartLineId: line.id,
              price: {
                adjustment: {
                  fixedPricePerUnit: {
                    amount: payloadObj.price.toString()
                  }
                }
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ops;
  }, []);

  return { operations };
}
