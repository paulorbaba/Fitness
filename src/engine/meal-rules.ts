export const PROHIBITED_ITEMS = {
  salts: ['refined_salt'],
  sweeteners: ['sugar', 'artificial_sweetener', 'aspartame', 'sucralose', 'saccharin'],
  beverages: ['soda', 'industrial_juice'],
  oils: ['canola_oil', 'corn_oil', 'sunflower_oil', 'soy_oil', 'margarine'],
  grains: ['wheat', 'barley', 'rye', 'wheat_flour'],
  dairy: ['cow_milk', 'regular_yogurt', 'regular_cheese'],
  legumes: ['unfermented_soy', 'corn', 'peanut'],
  processed: ['chips', 'crackers', 'instant_noodles', 'biscuits'],
};

export const ALLOWED_SUBSTITUTES = {
  salts: ['sea_salt', 'himalayan_salt', 'mossoró_salt'],
  sweeteners: ['stevia'],
  beverages: ['lemonade', 'passion_fruit_juice', 'watermelon_juice', 'coconut_water'],
  oils: ['lard', 'coconut_oil', 'extra_virgin_olive_oil', 'butter', 'ghee'],
  grains: ['rice_flour', 'almond_flour', 'flax_flour', 'coconut_flour', 'tapioca', 'polvilho', 'gluten_free_oats'],
  dairy: ['coconut_milk', 'almond_milk', 'coconut_yogurt', 'a2_casein', 'buffalo_cheese', 'goat_cheese'],
  fermented_soy: ['tofu', 'miso', 'natto', 'tempeh'],
};

export interface FoodRestriction {
  restriction_type: 'prohibited' | 'allowed';
  item: string;
  category: string;
  duration_months?: number;
  start_date?: string;
}

export function isIngredientAllowed(
  ingredientAllergenTags: string[],
  profileRestrictions: FoodRestriction[]
): boolean {
  const prohibited = profileRestrictions
    .filter(r => r.restriction_type === 'prohibited')
    .map(r => r.item);

  return !ingredientAllergenTags.some(tag => prohibited.includes(tag));
}

export function isDishSafeForAllProfiles(
  dishAllergenTags: string[],
  allProfileRestrictions: FoodRestriction[][]
): boolean {
  return allProfileRestrictions.every(restrictions =>
    isIngredientAllowed(dishAllergenTags, restrictions)
  );
}

export function getProhibitedCategories(): string[] {
  return Object.values(PROHIBITED_ITEMS).flat();
}

export function getAllowedCategories(): string[] {
  return Object.values(ALLOWED_SUBSTITUTES).flat();
}
