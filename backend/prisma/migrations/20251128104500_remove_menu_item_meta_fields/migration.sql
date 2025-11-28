-- Drop preparation_time and allergens columns from menu_items
ALTER TABLE "menu_items"
  DROP COLUMN IF EXISTS "preparation_time",
  DROP COLUMN IF EXISTS "allergens";
