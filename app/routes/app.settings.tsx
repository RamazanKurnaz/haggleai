import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit, Form, useNavigation } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopConfig, upsertShopConfig } from "../models/shop-config.server";
import crypto from "crypto";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopConfig = await getShopConfig(session.shop);

  return json({
    shopConfig: shopConfig || {
      maxDiscountPercentage: 20,
      hmacSecretKey: crypto.randomBytes(32).toString("hex"),
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "generate_key") {
    return json({
      generatedKey: crypto.randomBytes(32).toString("hex"),
      status: "success",
      message: "New key generated. Click Save to apply.",
    });
  }

  const maxDiscount = parseFloat(formData.get("maxDiscount") as string);
  const hmacSecret = formData.get("hmacSecret") as string;

  if (isNaN(maxDiscount) || maxDiscount < 0 || maxDiscount > 100) {
    return json({ status: "error", message: "Invalid discount percentage" }, { status: 400 });
  }

  if (!hmacSecret || hmacSecret.length < 32) {
    return json({ status: "error", message: "Secret key must be at least 32 characters" }, { status: 400 });
  }

  // 1. Save to Database (for our API usage)
  await upsertShopConfig(session.shop, maxDiscount, hmacSecret);

  // 2. Sync HMAC Secret to Shopify Metafields (for Cart Transform Function usage)
  // Note: This is optional since Cart Transform Function is currently disabled
  // When re-enabled with Rust, it will read from Shop Metafields
  try {
    // First, get the shop ID
    const shopResponse = await admin.graphql(`
      query GetShopId {
        shop {
          id
        }
      }
    `);
    
    const shopData = await shopResponse.json();
    const shopId = shopData.data?.shop?.id;
    
    if (shopId) {
      await admin.graphql(`
        mutation SetShopMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              key
              namespace
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          metafields: [
            {
              namespace: "haggle_ai",
              key: "hmac_secret",
              type: "single_line_text_field",
              value: hmacSecret,
              ownerId: shopId
            }
          ]
        }
      });
    }
  } catch (error) {
    console.error("Metafield sync error (non-critical):", error);
    // Non-critical: settings are saved to DB, Metafield sync is for future Function
  }

  return json({ status: "success", message: "Settings saved successfully!" });
};

export default function Settings() {
  const { shopConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  const defaultKey = actionData?.generatedKey || shopConfig.hmacSecretKey;
  
  const [hmacKey, setHmacKey] = useState(defaultKey);
  const [discount, setDiscount] = useState(shopConfig.maxDiscountPercentage.toString());

  useEffect(() => {
    if (actionData?.generatedKey) {
      setHmacKey(actionData.generatedKey);
    }
  }, [actionData]);

  const generateKey = () => {
    submit({ intent: "generate_key" }, { method: "post" });
  };

  const save = () => {
    submit({ intent: "save", maxDiscount: discount, hmacSecret: hmacKey }, { method: "post" });
  };

  return (
    <Page title="HaggleAI Settings">
      <Layout>
        <Layout.Section>
          {actionData?.message && (
            <Banner
              title={actionData.status === "success" ? "Success" : "Error"}
              tone={actionData.status === "success" ? "success" : "critical"}
            >
              <p>{actionData.message}</p>
            </Banner>
          )}
          
          <BlockStack gap="500">
             <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Global Configuration
                </Text>
                <FormLayout>
                  <TextField
                    label="Global Floor Price Percentage (Max Discount)"
                    type="number"
                    value={discount}
                    onChange={(value) => setDiscount(value)}
                    suffix="%"
                    helpText="The maximum discount percentage allowed globally. E.g., 20 means the price will never go below 20% off."
                    autoComplete="off"
                  />
                  
                  <TextField
                    label="HMAC Secret Key"
                    value={hmacKey}
                    onChange={(value) => setHmacKey(value)}
                    autoComplete="off"
                    helpText="Used to sign price offers securely. Must match the key in your Shopify Function."
                    connectedRight={
                      <Button onClick={generateKey} disabled={isLoading}>
                        Generate New
                      </Button>
                    }
                  />

                  <Button onClick={save} variant="primary" loading={isLoading}>
                    Save Settings
                  </Button>
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
