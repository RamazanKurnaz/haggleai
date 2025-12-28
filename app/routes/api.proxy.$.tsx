/**
 * HaggleAI - App Proxy Route
 * 
 * Bu route, Shopify App Proxy üzerinden gelen tüm istekleri yakalar.
 * Storefront'tan gelen istekler:
 *   /apps/haggle/chat → /api/proxy/chat
 *   /apps/haggle/sign-offer → /api/proxy/sign-offer
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { evaluateOffer } from "../services/negotiation.server";
import { getShopConfig } from "../models/shop-config.server";
import { signOffer } from "../utils/security.server";

// CORS Headers for storefront requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// OPTIONS handler for preflight requests
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  console.log("🔥 [PROXY LOADER] Request:", url.pathname);

  try {
    // Authenticate app proxy request
    const { session } = await authenticate.public.appProxy(request);
    
    return json(
      {
        ok: true,
        message: "HaggleAI Proxy is working",
        shop: session?.shop || "unknown",
        pathname: url.pathname,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ [PROXY LOADER] Auth error:", error);
    return json(
      { ok: false, error: "Authentication failed" },
      { status: 401, headers: corsHeaders }
    );
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const proxyPath = params["*"] ?? "";
  
  console.log("🔥 [PROXY ACTION] Path:", proxyPath, "URL:", url.pathname);

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1) Authenticate app proxy request
    const { session } = await authenticate.public.appProxy(request);

    if (!session) {
      console.error("❌ [PROXY] No session found");
      return json(
        { error: "Unauthorized - No session" },
        { status: 401, headers: corsHeaders }
      );
    }

    const shop = session.shop;
    console.log(`✅ [PROXY] Authenticated for shop: ${shop}`);

    // 2) Route based on path
    if (proxyPath === "chat" || proxyPath === "api/chat") {
      return await handleChat(request, shop);
    }

    if (proxyPath === "sign-offer" || proxyPath === "api/sign-offer") {
      return await handleSignOffer(request, shop);
    }

    // Default: echo for testing
    if (proxyPath === "" || proxyPath === "/") {
      return json(
        {
          ok: true,
          message: "HaggleAI Proxy ready",
          shop,
          availableEndpoints: ["/chat", "/sign-offer"],
        },
        { headers: corsHeaders }
      );
    }

    // 404 for unknown routes
    console.warn("⚠️ [PROXY] Unknown route:", proxyPath);
    return json(
      { error: "Not found", path: proxyPath },
      { status: 404, headers: corsHeaders }
    );

  } catch (error) {
    console.error("🔥 [PROXY ERROR]", error);
    return json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
};

/**
 * Handle chat/negotiation requests
 */
async function handleChat(request: Request, shop: string) {
  let body: Record<string, unknown>;
  
  try {
    body = await request.json();
  } catch {
    return json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { productId, variantId, productTitle, productPrice, offer, sessionId } = body as {
    productId?: string;
    variantId?: string;
    productTitle?: string;
    productPrice?: number;
    offer?: string | number;
    sessionId?: string;
  };

  console.log("📩 [CHAT]", { shop, productId, offer, sessionId });

  // Validate offer
  if (!offer || isNaN(Number(offer))) {
    return json(
      {
        message: "Please enter a valid price to start negotiating.",
        accepted: false,
      },
      { headers: corsHeaders }
    );
  }

  const numericOffer = parseFloat(String(offer));
  const numericPrice = parseFloat(String(productPrice)) || 0;

  // Evaluate the offer
  const result = await evaluateOffer(
    shop,
    productId || "",
    numericPrice,
    productTitle || "Product",
    numericOffer
  );

  // Create or update session
  let negotiationSession;
  try {
    if (sessionId) {
      negotiationSession = await prisma.negotiationSession.update({
        where: { sessionId },
        data: {
          currentOffer: numericOffer,
          status: result.accepted ? "ACCEPTED" : "REJECTED",
          updatedAt: new Date(),
        },
      });
    } else {
      negotiationSession = await prisma.negotiationSession.create({
        data: {
          shop,
          cartId: "guest-cart",
          productId: productId || "",
          variantId: variantId || "",
          originalPrice: result.originalPrice,
          minFloorPrice: result.floorPrice,
          currentOffer: numericOffer,
          status: result.accepted ? "ACCEPTED" : "REJECTED",
        },
      });
    }
  } catch (dbError) {
    console.error("❌ [CHAT] Database error:", dbError);
    // Continue without session tracking
    negotiationSession = { sessionId: `temp_${Date.now()}` };
  }

  return json(
    {
      sessionId: negotiationSession.sessionId,
      message: result.responseMessage,
      accepted: result.accepted,
      suggestedPrice: result.accepted ? numericOffer : null,
    },
    { headers: corsHeaders }
  );
}

/**
 * Handle sign-offer requests (for checkout)
 */
async function handleSignOffer(request: Request, shop: string) {
  let body: Record<string, unknown>;
  
  try {
    body = await request.json();
  } catch {
    return json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { sessionId } = body as { sessionId?: string };

  if (!sessionId) {
    return json(
      { error: "Missing sessionId" },
      { status: 400, headers: corsHeaders }
    );
  }

  console.log("✍️ [SIGN-OFFER]", { shop, sessionId });

  // Find the session
  const session = await prisma.negotiationSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    return json(
      { error: "Session not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  if (session.status !== "ACCEPTED") {
    return json(
      { error: "Offer not accepted yet" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!session.currentOffer) {
    return json(
      { error: "No offer amount found" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Get shop config for HMAC key
  const config = await getShopConfig(shop);
  
  if (!config || !config.hmacSecretKey) {
    // Generate a temporary key for MVP (not secure for production)
    console.warn("⚠️ [SIGN-OFFER] No HMAC key configured, using fallback");
    const fallbackKey = `${shop}-${process.env.SHOPIFY_API_SECRET || 'dev-key'}`;
    
    const signedData = signOffer(
      session.variantId || session.productId,
      Number(session.currentOffer),
      fallbackKey
    );

    return json(
      {
        payload: signedData.payload,
        signature: signedData.signature,
        timestamp: signedData.timestamp,
        variantId: session.variantId || session.productId,
        price: session.currentOffer,
      },
      { headers: corsHeaders }
    );
  }

  const signedData = signOffer(
    session.variantId || session.productId,
    Number(session.currentOffer),
    config.hmacSecretKey
  );

  return json(
    {
      payload: signedData.payload,
      signature: signedData.signature,
      timestamp: signedData.timestamp,
      variantId: session.variantId || session.productId,
      price: session.currentOffer,
    },
    { headers: corsHeaders }
  );
}
