-- Remove station metadata columns from menu and order items
ALTER TABLE "order_items"
  DROP COLUMN IF EXISTS "station";

ALTER TABLE "menu_items"
  DROP COLUMN IF EXISTS "station";
