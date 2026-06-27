import type { MealSlot, Modality, TrainingFocus, MuscleGroup, BlockType } from './constants';

// ─── Macro Targets ───────────────────────────────────────────────────────────

export interface MacroTargets {
  proteinG: number;
  carbG: number;
  carbLowG?: number;
  fatG: number;
  calories: number;
}

// ─── Food Restriction ────────────────────────────────────────────────────────

export interface FoodRestriction {
  id: number;
  profileId: string;
  restrictionType: 'prohibited' | 'allowed';
  item: string;
  category?: string | null;
  durationMonths?: number | null;
  startDate?: string | null;
}

// ─── Training Preference ─────────────────────────────────────────────────────

export interface TrainingPreference {
  id: number;
  profileId: string;
  modality: Modality;
  daysPerWeek?: number | null;
  priority: number;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  avatarUrl?: string | null;
  age: number;
  weightKg: number;
  heightM: number;
  goal: string;
  trainingIntensity: string;
  trainsFasted: boolean;
  trainingTime: string;
  proteinTargetG: number;
  carbTargetG: number;
  carbTargetLowG?: number | null;
  fatTargetG: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  restrictions: FoodRestriction[];
  preferences: TrainingPreference[];
}

// ─── Ingredient ──────────────────────────────────────────────────────────────

export interface Ingredient {
  id: number;
  name: string;
  namePt: string;
  category: string;
  storeSection: string;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  caloriesPer100g: number;
  isAllowed: boolean;
  allergenTags?: string[] | null;
  unit: string;
}

// ─── Dish Ingredient (with resolved ingredient data) ─────────────────────────

export interface DishIngredientEntry {
  id: number;
  dishId: number;
  ingredientId: number;
  quantityG: number;
  isOptional: boolean;
  notes?: string | null;
  ingredient: Ingredient;
}

// ─── Dish with Ingredients ───────────────────────────────────────────────────

export interface DishWithIngredients {
  id: number;
  name: string;
  description?: string | null;
  mealSlot: MealSlot;
  tags?: string[] | null;
  prepTimeMin?: number | null;
  isBatchCookable: boolean;
  servings: number;
  createdAt?: Date | null;
  ingredients: DishIngredientEntry[];
  totalMacros: MacroTargets;
}

// ─── Meal Assignment ─────────────────────────────────────────────────────────

export interface MealAssignment {
  id: number;
  cycleId: number;
  profileId: string;
  dayNumber: number;
  date: string;
  mealSlot: MealSlot;
  dishId: number;
  portionMultiplier: number;
  proteinG?: number | null;
  carbG?: number | null;
  fatG?: number | null;
  calories?: number | null;
  isHighCarbDay: boolean;
  dish: DishWithIngredients;
}

// ─── Menu Cycle ──────────────────────────────────────────────────────────────

export interface CycleWithMeals {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: Date | null;
  finalizedAt?: Date | null;
  meals: MealAssignment[];
}

// ─── Shopping List ───────────────────────────────────────────────────────────

export interface ShoppingListItem {
  id: number;
  cycleId: number;
  ingredientId: number;
  totalQuantityG: number;
  storeSection: string;
  checked: boolean;
  ingredient: Ingredient;
}

// ─── Exercise ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: number;
  name: string;
  namePt: string;
  modality: Modality;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[] | null;
  equipment?: string[] | null;
  movementType?: string | null;
  difficulty: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  executionTips?: string | null;
  avoidWith?: string[] | null;
  tags?: string[] | null;
}

// ─── Session Exercise Log ────────────────────────────────────────────────────

export interface SessionExerciseLog {
  id: number;
  sessionExerciseId: number;
  setNumber: number;
  actualReps?: number | null;
  actualWeightKg?: number | null;
  rpe?: number | null;
  completed: boolean;
  notes?: string | null;
}

// ─── Session Exercise (with exercise data and logs) ──────────────────────────

export interface SessionExerciseWithDetails {
  id: number;
  sessionId: number;
  exerciseId: number;
  blockType: BlockType;
  orderIndex: number;
  prescribedSets?: number | null;
  prescribedReps?: string | null;
  prescribedWeightKg?: number | null;
  prescribedRpe?: number | null;
  restSeconds?: number | null;
  intensityTechnique?: string | null;
  toFailure: boolean;
  supersetGroup?: string | null;
  notes?: string | null;
  exercise: Exercise;
  logs: SessionExerciseLog[];
}

// ─── Training Session (with exercises and logs) ──────────────────────────────

export interface TrainingSession {
  id: number;
  profileId: string;
  date: string;
  modality: Modality;
  focus: TrainingFocus;
  muscleGroups: MuscleGroup[];
  status: string;
  notes?: string | null;
  durationMin?: number | null;
  createdAt?: Date | null;
  completedAt?: Date | null;
  exercises: SessionExerciseWithDetails[];
}

// ─── Generation Params ───────────────────────────────────────────────────────

export interface GenerateTrainingParams {
  profileId: string;
  date: string;
  modality: Modality;
  focus: TrainingFocus;
  muscleGroups: MuscleGroup[];
  durationMin?: number;
  availableEquipment?: string[];
  excludeExerciseIds?: number[];
  notes?: string;
}

export interface GenerateCycleParams {
  profileIds: string[];
  startDate: string;
  durationDays: number;
  highCarbDays?: number[];
  excludeIngredientIds?: number[];
  batchCookPreference?: boolean;
  maxPrepTimeMin?: number;
}
