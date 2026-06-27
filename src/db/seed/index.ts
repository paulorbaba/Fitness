import { db } from '@/db';
import * as schema from '@/db/schema';
import { ingredientsSeed } from './ingredients';
import { exercisesSeed } from './exercises';
import { dishesSeed } from './dishes';
import {
  profilesSeed,
  pauloRestrictions,
  milenaRestrictions,
  pauloTrainingPreferences,
  milenaTrainingPreferences,
} from './profiles';

export async function seed() {
  console.log('Seeding ingredients...');
  for (const ing of ingredientsSeed) {
    await db.insert(schema.ingredients).values({
      name: ing.name,
      namePt: ing.name_pt,
      category: ing.category,
      storeSection: ing.store_section,
      proteinPer100g: String(ing.protein_per_100g),
      carbPer100g: String(ing.carb_per_100g),
      fatPer100g: String(ing.fat_per_100g),
      caloriesPer100g: String(ing.calories_per_100g),
      isAllowed: ing.is_allowed,
      allergenTags: ing.allergen_tags,
    }).onConflictDoNothing();
  }

  console.log('Seeding exercises...');
  for (const ex of exercisesSeed) {
    await db.insert(schema.exercises).values({
      name: ex.name,
      namePt: ex.name_pt,
      modality: ex.modality,
      primaryMuscles: ex.primary_muscles,
      secondaryMuscles: ex.secondary_muscles,
      equipment: ex.equipment,
      movementType: ex.movement_type,
      difficulty: ex.difficulty,
      videoUrl: ex.video_url,
      executionTips: ex.execution_tips,
      tags: ex.tags,
    }).onConflictDoNothing();
  }

  console.log('Seeding profiles...');
  const profileIds: string[] = [];
  for (const p of profilesSeed) {
    const [inserted] = await db.insert(schema.profiles).values({
      name: p.name,
      age: p.age,
      weightKg: p.weight_kg,
      heightM: p.height_m,
      goal: p.goal,
      trainingIntensity: p.training_intensity,
      trainsFasted: p.trains_fasted,
      trainingTime: p.training_time,
      proteinTargetG: p.protein_target_g,
      carbTargetG: p.carb_target_g,
      carbTargetLowG: p.carb_target_low_g,
      fatTargetG: p.fat_target_g,
    }).returning();
    profileIds.push(inserted.id);
  }

  const [pauloId, milenaId] = profileIds;

  console.log('Seeding food restrictions...');
  for (const r of pauloRestrictions) {
    await db.insert(schema.foodRestrictions).values({
      profileId: pauloId,
      restrictionType: r.restriction_type,
      item: r.item,
      category: r.category,
    });
  }
  for (const r of milenaRestrictions) {
    await db.insert(schema.foodRestrictions).values({
      profileId: milenaId,
      restrictionType: r.restriction_type,
      item: r.item,
      category: r.category,
      durationMonths: 'duration_months' in r ? (r as { duration_months: number }).duration_months : undefined,
    });
  }

  console.log('Seeding training preferences...');
  for (const tp of pauloTrainingPreferences) {
    await db.insert(schema.trainingPreferences).values({
      profileId: pauloId,
      modality: tp.modality,
      daysPerWeek: tp.days_per_week,
      priority: tp.priority,
    });
  }
  for (const tp of milenaTrainingPreferences) {
    await db.insert(schema.trainingPreferences).values({
      profileId: milenaId,
      modality: tp.modality,
      daysPerWeek: tp.days_per_week,
      priority: tp.priority,
    });
  }

  console.log('Seeding dishes...');
  for (const dish of dishesSeed) {
    const [inserted] = await db.insert(schema.dishes).values({
      name: dish.name,
      description: dish.description,
      mealSlot: dish.meal_slot,
      tags: dish.tags,
      prepTimeMin: dish.prep_time_min,
      isBatchCookable: dish.is_batch_cookable,
      servings: dish.servings,
    }).returning();

    for (const ing of dish.ingredients) {
      await db.insert(schema.dishIngredients).values({
        dishId: inserted.id,
        ingredientId: ing.ingredient_id,
        quantityG: String(ing.quantity_g),
        isOptional: false,
        notes: 'notes' in ing ? (ing as { notes: string }).notes : null,
      });
    }
  }

  console.log('Seed complete!');
}
