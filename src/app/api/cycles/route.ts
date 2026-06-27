import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { generateMealCycle } from '@/engine/meal-cycle-generator';

export async function GET() {
  try {
    const cycles = await db.select().from(schema.menuCycles).orderBy(desc(schema.menuCycles.startDate));
    return NextResponse.json({ data: cycles });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ciclos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const startDate = body.startDate || new Date().toISOString().split('T')[0];

    const allDishes = await db.select().from(schema.dishes);
    const profiles = await db.select().from(schema.profiles);

    const dishesWithMacros = await Promise.all(
      allDishes.map(async (dish) => {
        const ings = await db.select({
          di: schema.dishIngredients,
          ing: schema.ingredients,
        }).from(schema.dishIngredients)
          .innerJoin(schema.ingredients, eq(schema.dishIngredients.ingredientId, schema.ingredients.id))
          .where(eq(schema.dishIngredients.dishId, dish.id));

        let protein = 0, carb = 0, fat = 0;
        for (const row of ings) {
          const qty = Number(row.di.quantityG) / 100;
          protein += Number(row.ing.proteinPer100g) * qty;
          carb += Number(row.ing.carbPer100g) * qty;
          fat += Number(row.ing.fatPer100g) * qty;
        }

        return {
          id: dish.id,
          name: dish.name,
          meal_slot: dish.mealSlot,
          is_batch_cookable: dish.isBatchCookable ?? false,
          protein_per_serving: Math.round(protein * 10) / 10,
          carb_per_serving: Math.round(carb * 10) / 10,
          fat_per_serving: Math.round(fat * 10) / 10,
          tags: dish.tags ?? [],
        };
      })
    );

    const profilesForCycle = profiles.map(p => ({
      id: p.id,
      name: p.name,
      protein_target_g: p.proteinTargetG,
      carb_target_g: p.carbTargetG,
      carb_target_low_g: p.carbTargetLowG ?? undefined,
      fat_target_g: p.fatTargetG,
    }));

    const cycle = generateMealCycle(dishesWithMacros, profilesForCycle, startDate);

    const [menuCycle] = await db.insert(schema.menuCycles).values({
      startDate: cycle.start_date,
      endDate: cycle.end_date,
      status: 'draft',
    }).returning();

    for (const dishId of cycle.selected_dishes) {
      await db.insert(schema.cycleDishes).values({
        cycleId: menuCycle.id,
        dishId,
        batchQuantity: 1,
      });
    }

    const assignmentValues = cycle.assignments.map(a => ({
      cycleId: menuCycle.id,
      profileId: a.profile_id,
      dayNumber: a.day_number,
      date: a.date,
      mealSlot: a.meal_slot,
      dishId: a.dish_id,
      portionMultiplier: String(a.portion_multiplier),
      proteinG: String(a.protein_g),
      carbG: String(a.carb_g),
      fatG: String(a.fat_g),
      calories: String(a.calories),
      isHighCarbDay: a.is_high_carb_day,
    }));

    if (assignmentValues.length > 0) {
      for (let i = 0; i < assignmentValues.length; i += 50) {
        await db.insert(schema.dailyMealAssignments).values(assignmentValues.slice(i, i + 50));
      }
    }

    return NextResponse.json({ data: menuCycle }, { status: 201 });
  } catch (error) {
    console.error('Cycle generation error:', error);
    return NextResponse.json({ error: 'Erro ao gerar ciclo' }, { status: 500 });
  }
}
