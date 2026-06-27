import { type MacroTargets, getSlotTargets, calculatePortionMultiplier, calculatePortionMacros, getDailyTargetsForProfile } from './portion-calculator';

export interface DishForCycle {
  id: number;
  name: string;
  meal_slot: string;
  is_batch_cookable: boolean;
  protein_per_serving: number;
  carb_per_serving: number;
  fat_per_serving: number;
  tags: string[];
}

export interface ProfileForCycle {
  id: string;
  name: string;
  protein_target_g: number;
  carb_target_g: number;
  carb_target_low_g?: number;
  fat_target_g: number;
}

export interface MealAssignment {
  day_number: number;
  date: string;
  meal_slot: string;
  dish_id: number;
  profile_id: string;
  portion_multiplier: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  calories: number;
  is_high_carb_day: boolean;
}

export interface GeneratedCycle {
  start_date: string;
  end_date: string;
  selected_dishes: number[];
  assignments: MealAssignment[];
}

const MEAL_SLOTS = ['post_workout', 'lunch', 'snack', 'dinner'];
const CYCLE_DAYS = 15;

// Default high carb days pattern for Paulo (CrossFit/Hyrox days)
// Mon, Wed, Fri, Sat are high carb; Tue, Thu, Sun are low carb
const DEFAULT_HIGH_CARB_DAYS = [1, 3, 5, 6]; // 0-indexed day of week (Mon=1)

function isHighCarbDay(date: string, profileName: string): boolean {
  if (profileName.toLowerCase() !== 'paulo') return false;
  const dayOfWeek = new Date(date).getDay();
  return DEFAULT_HIGH_CARB_DAYS.includes(dayOfWeek);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateMealCycle(
  dishes: DishForCycle[],
  profiles: ProfileForCycle[],
  startDate: string
): GeneratedCycle {
  // Group dishes by meal slot
  const dishesBySlot: Record<string, DishForCycle[]> = {};
  for (const slot of MEAL_SLOTS) {
    dishesBySlot[slot] = dishes.filter(d => d.meal_slot === slot);
  }

  // Select 6-10 dishes for the cycle, prioritizing batch-cookable
  const selectedDishes: DishForCycle[] = [];
  for (const slot of MEAL_SLOTS) {
    const available = shuffleArray(dishesBySlot[slot]);
    const batchFirst = available.sort((a, b) => (b.is_batch_cookable ? 1 : 0) - (a.is_batch_cookable ? 1 : 0));
    // Take 2-3 per slot
    const count = Math.min(Math.max(2, Math.ceil(available.length * 0.3)), 3);
    selectedDishes.push(...batchFirst.slice(0, count));
  }

  const selectedDishIds = selectedDishes.map(d => d.id);
  const assignments: MealAssignment[] = [];
  const endDate = addDays(startDate, CYCLE_DAYS - 1);

  // For each day, assign dishes to slots
  for (let day = 0; day < CYCLE_DAYS; day++) {
    const date = addDays(startDate, day);

    for (const slot of MEAL_SLOTS) {
      const slotDishes = selectedDishes.filter(d => d.meal_slot === slot);
      if (slotDishes.length === 0) continue;

      // Rotate dishes to avoid repetition in consecutive days
      const dishIndex = day % slotDishes.length;
      const dish = slotDishes[dishIndex];

      // Create assignment for each profile
      for (const profile of profiles) {
        const highCarb = isHighCarbDay(date, profile.name);
        const dailyTargets = getDailyTargetsForProfile(profile, highCarb);
        const slotTargets = getSlotTargets(dailyTargets, slot);

        const dishMacros = {
          protein_per_serving: dish.protein_per_serving,
          carb_per_serving: dish.carb_per_serving,
          fat_per_serving: dish.fat_per_serving,
        };

        const multiplier = calculatePortionMultiplier(slotTargets, dishMacros);
        const macros = calculatePortionMacros(dishMacros, multiplier);

        assignments.push({
          day_number: day + 1,
          date,
          meal_slot: slot,
          dish_id: dish.id,
          profile_id: profile.id,
          portion_multiplier: multiplier,
          protein_g: macros.protein_g,
          carb_g: macros.carb_g,
          fat_g: macros.fat_g,
          calories: macros.calories,
          is_high_carb_day: highCarb,
        });
      }
    }
  }

  return {
    start_date: startDate,
    end_date: endDate,
    selected_dishes: selectedDishIds,
    assignments,
  };
}
