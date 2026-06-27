export interface MacroTargets {
  protein_g: number;
  carb_g: number;
  fat_g: number;
}

export interface DishMacros {
  protein_per_serving: number;
  carb_per_serving: number;
  fat_per_serving: number;
}

// How daily macros are distributed across meal slots
// post_workout gets more protein/carbs for recovery
// dinner gets extra carbs for next-day fasted training fuel
export const SLOT_DISTRIBUTION: Record<string, { protein: number; carb: number; fat: number }> = {
  post_workout: { protein: 0.30, carb: 0.30, fat: 0.20 },
  lunch:        { protein: 0.30, carb: 0.30, fat: 0.30 },
  snack:        { protein: 0.15, carb: 0.10, fat: 0.25 },
  dinner:       { protein: 0.25, carb: 0.30, fat: 0.25 },
};

export function getSlotTargets(dailyTargets: MacroTargets, slot: string): MacroTargets {
  const dist = SLOT_DISTRIBUTION[slot] ?? SLOT_DISTRIBUTION.lunch;
  return {
    protein_g: Math.round(dailyTargets.protein_g * dist.protein),
    carb_g: Math.round(dailyTargets.carb_g * dist.carb),
    fat_g: Math.round(dailyTargets.fat_g * dist.fat),
  };
}

export function calculatePortionMultiplier(
  slotTargets: MacroTargets,
  dishMacros: DishMacros
): number {
  // Use protein as the primary driver for portion sizing
  // since the app focuses on protein targets
  if (dishMacros.protein_per_serving <= 0) {
    // For dishes with negligible protein (e.g., fruit snack), use carbs
    if (dishMacros.carb_per_serving <= 0) return 1;
    return Math.max(0.5, Math.min(3, slotTargets.carb_g / dishMacros.carb_per_serving));
  }

  const proteinMultiplier = slotTargets.protein_g / dishMacros.protein_per_serving;
  // Clamp between 0.5x and 3x to keep portions reasonable
  return Math.max(0.5, Math.min(3, Math.round(proteinMultiplier * 100) / 100));
}

export function calculatePortionMacros(
  dishMacros: DishMacros,
  multiplier: number
): { protein_g: number; carb_g: number; fat_g: number; calories: number } {
  const protein_g = Math.round(dishMacros.protein_per_serving * multiplier * 10) / 10;
  const carb_g = Math.round(dishMacros.carb_per_serving * multiplier * 10) / 10;
  const fat_g = Math.round(dishMacros.fat_per_serving * multiplier * 10) / 10;
  const calories = Math.round(protein_g * 4 + carb_g * 4 + fat_g * 9);
  return { protein_g, carb_g, fat_g, calories };
}

export function getDailyTargetsForProfile(
  profile: { protein_target_g: number; carb_target_g: number; carb_target_low_g?: number; fat_target_g: number },
  isHighCarbDay: boolean
): MacroTargets {
  return {
    protein_g: profile.protein_target_g,
    carb_g: isHighCarbDay ? profile.carb_target_g : (profile.carb_target_low_g ?? profile.carb_target_g),
    fat_g: profile.fat_target_g,
  };
}
