export const PRODUCT_CATEGORIES = [
  "Study Material",
  "Foods",
  "Rooms",
  "Vehicle",
  "Kitchen Accessories",
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
