-- Add kitchen-specific metadata to menu_items and order_items
ALTER TABLE "menu_items"
  ADD COLUMN "station" TEXT,
  ADD COLUMN "preparation_time" INTEGER,
  ADD COLUMN "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "order_items"
  ADD COLUMN "station" TEXT,
  ADD COLUMN "allergies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "cooking_started_at" TIMESTAMP(3),
  ADD COLUMN "ready_at" TIMESTAMP(3),
  ADD COLUMN "served_at" TIMESTAMP(3),
  ADD COLUMN "rejection_reason" TEXT;
