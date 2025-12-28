import { getShopConfig } from "../models/shop-config.server";

interface EvaluationResult {
  accepted: boolean;
  floorPrice: number;
  originalPrice: number;
  responseMessage: string;
}

/**
 * Evaluates a customer's offer against the merchant's floor price.
 * 
 * MVP Version: Uses simple rule-based logic without AI.
 * The floor price is calculated as: originalPrice * (1 - maxDiscountPercentage/100)
 * 
 * @param shop The shop domain (e.g., my-shop.myshopify.com)
 * @param productId The Shopify Product ID
 * @param productPrice The current price of the product
 * @param productTitle The title of the product
 * @param customerOffer The price offered by the customer
 */
export async function evaluateOffer(
  shop: string,
  productId: string,
  productPrice: number,
  productTitle: string,
  customerOffer: number
): Promise<EvaluationResult> {
  // 1. Get Merchant Settings
  const config = await getShopConfig(shop);
  
  // Default to 20% max discount if not configured
  const maxDiscountPercentage = config?.maxDiscountPercentage ?? 20;

  // 2. Calculate Floor Price (minimum acceptable price)
  const floorPrice = productPrice * (1 - maxDiscountPercentage / 100);
  
  // 3. Make the Decision (Hard-coded Logic)
  const isAccepted = customerOffer >= floorPrice;

  // 4. Calculate discount percentage for messaging
  const discountPercent = Math.round(((productPrice - customerOffer) / productPrice) * 100);
  
  // 5. Generate Response Message (Simple fallback - no AI)
  let responseMessage: string;

  if (isAccepted) {
    responseMessage = generateAcceptMessage(customerOffer, productTitle, discountPercent);
  } else {
    // Calculate a counter-offer (midpoint between offer and floor)
    const counterOffer = Math.round((customerOffer + floorPrice) / 2);
    responseMessage = generateRejectMessage(customerOffer, productTitle, counterOffer, productPrice);
  }

  return {
    accepted: isAccepted,
    floorPrice,
    originalPrice: productPrice,
    responseMessage,
  };
}

/**
 * Generates acceptance message
 */
function generateAcceptMessage(
  offer: number,
  productTitle: string,
  discountPercent: number
): string {
  const messages = [
    `Great news! 🎉 Your offer of $${offer.toFixed(2)} for the ${productTitle} has been accepted! That's ${discountPercent}% off. Click below to add it to your cart at this special price!`,
    `Deal! 🤝 I accept your offer of $${offer.toFixed(2)} for the ${productTitle}. You've saved ${discountPercent}%! Add it to your cart now before this offer expires.`,
    `You've got yourself a deal! ✨ $${offer.toFixed(2)} for the ${productTitle} works for me. Click to claim your ${discountPercent}% discount!`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generates rejection message with counter-offer
 */
function generateRejectMessage(
  offer: number,
  productTitle: string,
  counterOffer: number,
  originalPrice: number
): string {
  const counterDiscountPercent = Math.round(((originalPrice - counterOffer) / originalPrice) * 100);
  
  const messages = [
    `I appreciate your interest in the ${productTitle}! Unfortunately, $${offer.toFixed(2)} is a bit too low for this quality item. Would you consider $${counterOffer.toFixed(2)}? That's still ${counterDiscountPercent}% off!`,
    `Thanks for the offer! 🤔 $${offer.toFixed(2)} is below what I can accept for the ${productTitle}. How about $${counterOffer.toFixed(2)}? It's a fair deal for both of us!`,
    `Hmm, $${offer.toFixed(2)} is quite low for the ${productTitle}. I can do $${counterOffer.toFixed(2)} - that's ${counterDiscountPercent}% off the original price. What do you say?`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}
