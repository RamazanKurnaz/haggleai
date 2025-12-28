/*
  Warnings:

  - Added the required column `shop` to the `NegotiationSession` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NegotiationSession" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL DEFAULT '',
    "originalPrice" REAL NOT NULL,
    "minFloorPrice" REAL NOT NULL,
    "currentOffer" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_NegotiationSession" ("cartId", "createdAt", "currentOffer", "minFloorPrice", "originalPrice", "productId", "sessionId", "status", "updatedAt") SELECT "cartId", "createdAt", "currentOffer", "minFloorPrice", "originalPrice", "productId", "sessionId", "status", "updatedAt" FROM "NegotiationSession";
DROP TABLE "NegotiationSession";
ALTER TABLE "new_NegotiationSession" RENAME TO "NegotiationSession";
CREATE INDEX "NegotiationSession_cartId_idx" ON "NegotiationSession"("cartId");
CREATE INDEX "NegotiationSession_shop_idx" ON "NegotiationSession"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
