import { prisma } from "../db.server";

export async function getShopConfig(shop: string) {
  return prisma.shopConfig.findUnique({
    where: { shop },
  });
}

export async function upsertShopConfig(
  shop: string,
  maxDiscountPercentage: number,
  hmacSecretKey: string
) {
  return prisma.shopConfig.upsert({
    where: { shop },
    update: {
      maxDiscountPercentage,
      hmacSecretKey,
    },
    create: {
      shop,
      maxDiscountPercentage,
      hmacSecretKey,
    },
  });
}

