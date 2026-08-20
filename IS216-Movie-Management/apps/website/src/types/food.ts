export type FoodCategory = "All Items" | "COMBO" | "COUPLE_SET" | "POPCORN" | "DRINK" | "CANDY";

export const CATEGORY_LABELS: Record<string, string> = {
  COMBO: "Combos",
  COUPLE_SET: "Couple Sets",
  POPCORN: "Popcorn",
  DRINK: "Drinks",
  CANDY: "Candy",
};

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string | null;
  imageUrl: string;
  isAvailable: boolean;
}
