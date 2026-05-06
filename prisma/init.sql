CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE "PaymentGateway" AS ENUM (
  'PAYSTACK',
  'FLUTTERWAVE'
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "badge" TEXT,
  "emoji" TEXT,
  "accent" TEXT,
  "imageUrl" TEXT NOT NULL,
  "cloudinaryPublicId" TEXT,
  "skinGoal" TEXT NOT NULL,
  "collection" TEXT NOT NULL,
  "highlights" JSONB NOT NULL,
  "ingredients" JSONB NOT NULL,
  "howToUse" TEXT NOT NULL,
  "sku" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "trackInventory" BOOLEAN NOT NULL DEFAULT true,
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "isOutOfStock" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryLog" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantityBefore" INTEGER NOT NULL,
  "quantityAfter" INTEGER NOT NULL,
  "changeAmount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentGateway" "PaymentGateway",
  "paymentReference" TEXT,
  "subtotalAmount" INTEGER NOT NULL,
  "shippingAmount" INTEGER NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_isPublished_createdAt_idx" ON "Product"("isPublished", "createdAt");
CREATE INDEX "Product_category_brand_idx" ON "Product"("category", "brand");

CREATE INDEX "InventoryLog_productId_createdAt_idx" ON "InventoryLog"("productId", "createdAt");

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");
CREATE INDEX "Order_customerEmail_createdAt_idx" ON "Order"("customerEmail", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

ALTER TABLE "InventoryLog"
ADD CONSTRAINT "InventoryLog_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
