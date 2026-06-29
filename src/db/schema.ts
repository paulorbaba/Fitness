import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  serial,
  unique,
} from 'drizzle-orm/pg-core';

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  age: integer('age').notNull(),
  weightKg: numeric('weight_kg', { precision: 5, scale: 2 }).notNull(),
  heightM: numeric('height_m', { precision: 3, scale: 2 }).notNull(),
  goal: varchar('goal', { length: 50 }).notNull(),
  trainingIntensity: varchar('training_intensity', { length: 20 }).notNull(),
  trainsFasted: boolean('trains_fasted').default(true),
  trainingTime: varchar('training_time', { length: 20 }).default('morning'),
  proteinTargetG: integer('protein_target_g').notNull(),
  carbTargetG: integer('carb_target_g').notNull(),
  carbTargetLowG: integer('carb_target_low_g'),
  fatTargetG: integer('fat_target_g').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Food Restrictions ───────────────────────────────────────────────────────

export const foodRestrictions = pgTable('food_restrictions', {
  id: serial('id').primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  restrictionType: varchar('restriction_type', { length: 20 }).notNull(),
  item: varchar('item', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }),
  durationMonths: integer('duration_months'),
  startDate: date('start_date'),
});

// ─── Training Preferences ────────────────────────────────────────────────────

export const trainingPreferences = pgTable('training_preferences', {
  id: serial('id').primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  modality: varchar('modality', { length: 30 }).notNull(),
  daysPerWeek: integer('days_per_week'),
  priority: integer('priority').default(0),
});

// ─── Ingredients ─────────────────────────────────────────────────────────────

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  namePt: varchar('name_pt', { length: 150 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  storeSection: varchar('store_section', { length: 50 }).notNull(),
  proteinPer100g: numeric('protein_per_100g', { precision: 5, scale: 2 }).notNull(),
  carbPer100g: numeric('carb_per_100g', { precision: 5, scale: 2 }).notNull(),
  fatPer100g: numeric('fat_per_100g', { precision: 5, scale: 2 }).notNull(),
  fiberPer100g: numeric('fiber_per_100g', { precision: 5, scale: 2 }).default('0'),
  caloriesPer100g: numeric('calories_per_100g', { precision: 6, scale: 1 }).notNull(),
  isAllowed: boolean('is_allowed').default(true),
  allergenTags: text('allergen_tags').array(),
  unit: varchar('unit', { length: 20 }).default('g'),
});

// ─── Dishes ──────────────────────────────────────────────────────────────────

export const dishes = pgTable('dishes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  mealSlot: varchar('meal_slot', { length: 30 }).notNull(),
  tags: text('tags').array(),
  prepTimeMin: integer('prep_time_min'),
  isBatchCookable: boolean('is_batch_cookable').default(false),
  servings: integer('servings').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Dish Ingredients ────────────────────────────────────────────────────────

export const dishIngredients = pgTable('dish_ingredients', {
  id: serial('id').primaryKey(),
  dishId: integer('dish_id')
    .notNull()
    .references(() => dishes.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  quantityG: numeric('quantity_g', { precision: 7, scale: 2 }).notNull(),
  isOptional: boolean('is_optional').default(false),
  notes: varchar('notes', { length: 200 }),
});

// ─── Menu Cycles ─────────────────────────────────────────────────────────────

export const menuCycles = pgTable('menu_cycles', {
  id: serial('id').primaryKey(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: varchar('status', { length: 20 }).default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  finalizedAt: timestamp('finalized_at'),
});

// ─── Cycle Dishes ────────────────────────────────────────────────────────────

export const cycleDishes = pgTable('cycle_dishes', {
  id: serial('id').primaryKey(),
  cycleId: integer('cycle_id')
    .notNull()
    .references(() => menuCycles.id, { onDelete: 'cascade' }),
  dishId: integer('dish_id')
    .notNull()
    .references(() => dishes.id),
  batchQuantity: integer('batch_quantity').default(1),
});

// ─── Daily Meal Assignments ──────────────────────────────────────────────────

export const dailyMealAssignments = pgTable(
  'daily_meal_assignments',
  {
    id: serial('id').primaryKey(),
    cycleId: integer('cycle_id')
      .notNull()
      .references(() => menuCycles.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id),
    dayNumber: integer('day_number').notNull(),
    date: date('date').notNull(),
    mealSlot: varchar('meal_slot', { length: 30 }).notNull(),
    dishId: integer('dish_id')
      .notNull()
      .references(() => dishes.id),
    portionMultiplier: numeric('portion_multiplier', { precision: 4, scale: 2 })
      .notNull()
      .default('1.00'),
    proteinG: numeric('protein_g', { precision: 5, scale: 1 }),
    carbG: numeric('carb_g', { precision: 5, scale: 1 }),
    fatG: numeric('fat_g', { precision: 5, scale: 1 }),
    calories: numeric('calories', { precision: 6, scale: 1 }),
    isHighCarbDay: boolean('is_high_carb_day').default(false),
  },
  (table) => [
    unique('daily_meal_unique').on(table.cycleId, table.profileId, table.date, table.mealSlot),
  ],
);

// ─── Exercises ───────────────────────────────────────────────────────────────

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  namePt: varchar('name_pt', { length: 200 }).notNull(),
  modality: varchar('modality', { length: 30 }).notNull(),
  primaryMuscles: text('primary_muscles').array().notNull(),
  secondaryMuscles: text('secondary_muscles').array(),
  equipment: text('equipment').array(),
  movementType: varchar('movement_type', { length: 30 }),
  difficulty: varchar('difficulty', { length: 20 }).default('intermediate'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  executionTips: text('execution_tips'),
  avoidWith: text('avoid_with').array(),
  tags: text('tags').array(),
});

// ─── Training Sessions ──────────────────────────────────────────────────────

export const trainingSessions = pgTable('training_sessions', {
  id: serial('id').primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id),
  date: date('date').notNull(),
  modality: varchar('modality', { length: 30 }).notNull(),
  focus: varchar('focus', { length: 50 }).notNull(),
  muscleGroups: text('muscle_groups').array().notNull(),
  status: varchar('status', { length: 20 }).default('planned'),
  notes: text('notes'),
  durationMin: integer('duration_min'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// ─── Session Exercises ───────────────────────────────────────────────────────

export const sessionExercises = pgTable('session_exercises', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => trainingSessions.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id),
  blockType: varchar('block_type', { length: 20 }).notNull(),
  orderIndex: integer('order_index').notNull(),
  prescribedSets: integer('prescribed_sets'),
  prescribedReps: varchar('prescribed_reps', { length: 30 }),
  prescribedWeightKg: numeric('prescribed_weight_kg', { precision: 5, scale: 1 }),
  prescribedRpe: numeric('prescribed_rpe', { precision: 3, scale: 1 }),
  restSeconds: integer('rest_seconds'),
  intensityTechnique: varchar('intensity_technique', { length: 50 }),
  toFailure: boolean('to_failure').default(false),
  supersetGroup: varchar('superset_group', { length: 5 }),
  notes: text('notes'),
});

// ─── Session Exercise Logs ───────────────────────────────────────────────────

export const sessionExerciseLogs = pgTable('session_exercise_logs', {
  id: serial('id').primaryKey(),
  sessionExerciseId: integer('session_exercise_id')
    .notNull()
    .references(() => sessionExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  actualReps: integer('actual_reps'),
  actualWeightKg: numeric('actual_weight_kg', { precision: 5, scale: 1 }),
  rpe: numeric('rpe', { precision: 3, scale: 1 }),
  completed: boolean('completed').default(true),
  notes: text('notes'),
});

// ─── Shopping List Cache ─────────────────────────────────────────────────────

export const shoppingListCache = pgTable('shopping_list_cache', {
  id: serial('id').primaryKey(),
  cycleId: integer('cycle_id')
    .notNull()
    .references(() => menuCycles.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  totalQuantityG: numeric('total_quantity_g', { precision: 8, scale: 1 }).notNull(),
  storeSection: varchar('store_section', { length: 50 }).notNull(),
  checked: boolean('checked').default(false),
});

// ─── Daily Nutrition Logs ───────────────────────────────────────────────────

export const dailyNutritionLogs = pgTable(
  'daily_nutrition_logs',
  {
    id: serial('id').primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    mealSlot: varchar('meal_slot', { length: 30 }).notNull(),
    checked: boolean('checked').default(false),
    proteinG: numeric('protein_g', { precision: 5, scale: 1 }),
    carbG: numeric('carb_g', { precision: 5, scale: 1 }),
    fatG: numeric('fat_g', { precision: 5, scale: 1 }),
    fiberG: numeric('fiber_g', { precision: 5, scale: 1 }),
    calories: numeric('calories', { precision: 6, scale: 1 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    unique('daily_nutrition_unique').on(table.profileId, table.date, table.mealSlot),
  ],
);

// ─── Hydration Logs ─────────────────────────────────────────────────────────

export const hydrationLogs = pgTable(
  'hydration_logs',
  {
    id: serial('id').primaryKey(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    glasses: integer('glasses').default(0),
    targetGlasses: integer('target_glasses').default(8),
  },
  (table) => [
    unique('hydration_unique').on(table.profileId, table.date),
  ],
);
