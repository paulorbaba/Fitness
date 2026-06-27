export interface MealForShopping {
  dish_id: number;
  portion_multiplier: number;
}

export interface DishIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity_g: number;
  store_section: string;
  unit: string;
}

export interface ShoppingItem {
  ingredient_id: number;
  ingredient_name: string;
  total_quantity_g: number;
  store_section: string;
  unit: string;
  checked: boolean;
}

export function buildShoppingList(
  meals: MealForShopping[],
  dishIngredients: Record<number, DishIngredient[]>
): ShoppingItem[] {
  const totals = new Map<number, ShoppingItem>();

  for (const meal of meals) {
    const ingredients = dishIngredients[meal.dish_id];
    if (!ingredients) continue;

    for (const ing of ingredients) {
      const existing = totals.get(ing.ingredient_id);
      const qty = ing.quantity_g * meal.portion_multiplier;

      if (existing) {
        existing.total_quantity_g += qty;
      } else {
        totals.set(ing.ingredient_id, {
          ingredient_id: ing.ingredient_id,
          ingredient_name: ing.ingredient_name,
          total_quantity_g: qty,
          store_section: ing.store_section,
          unit: ing.unit,
          checked: false,
        });
      }
    }
  }

  // Round quantities and sort by store section
  const items = Array.from(totals.values()).map(item => ({
    ...item,
    total_quantity_g: Math.round(item.total_quantity_g),
  }));

  items.sort((a, b) => a.store_section.localeCompare(b.store_section) || a.ingredient_name.localeCompare(b.ingredient_name));
  return items;
}

export function groupBySection(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  const groups: Record<string, ShoppingItem[]> = {};
  for (const item of items) {
    if (!groups[item.store_section]) groups[item.store_section] = [];
    groups[item.store_section].push(item);
  }
  return groups;
}
