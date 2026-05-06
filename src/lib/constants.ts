import { Item } from "@/types";

export const CATEGORIES: string[] = [
  "Electronics",
  "Clothing",
  "Books and Notes",
  "ID and Cards",
  "Keys",
  "Bags and Wallets",
  "Accessories",
  "Documents",
  "Others",
];

export const LOCATIONS: string[] = [
  "Main Building",
  "Benavides Building",
  "Albertus Magnus Building",
  "Roque Ruano Building",
  "Thomas Aquinas Research Complex",
  "Central Laboratory",
  "Tan Yan Kee Student Center",
  "UST Gym",
  "Quadricentennial Pavilion",
  "UST Library",
  "Plaza Mayor",
  "Lovers Lane",
  "Arch of the Centuries",
  "Other",
];

export const HIGH_VALUE_CATEGORIES: Set<string> = new Set([
  "Electronics",
  "Bags and Wallets",
  "ID and Cards",
  "Accessories",
  "Documents",
]);

export function isProtected(item: Item): boolean {
  return item.type === "lost" && HIGH_VALUE_CATEGORIES.has(item.category);
}
