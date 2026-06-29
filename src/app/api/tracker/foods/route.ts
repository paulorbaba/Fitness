import { NextResponse } from 'next/server';
import { sql as vercelSql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const date = searchParams.get('date');
    const mealSlot = searchParams.get('mealSlot');

    if (!profileId || !date) {
      return NextResponse.json({ error: 'profileId e date obrigatórios' }, { status: 400 });
    }

    let result;
    if (mealSlot) {
      result = await vercelSql`
        SELECT mfi.*, i.name_pt as ingredient_name, i.default_portion_g, i.default_portion_label
        FROM meal_food_items mfi
        LEFT JOIN ingredients i ON i.id = mfi.ingredient_id
        WHERE mfi.profile_id = ${profileId} AND mfi.date = ${date} AND mfi.meal_slot = ${mealSlot}
        ORDER BY mfi.created_at ASC
      `;
    } else {
      result = await vercelSql`
        SELECT mfi.*, i.name_pt as ingredient_name, i.default_portion_g, i.default_portion_label
        FROM meal_food_items mfi
        LEFT JOIN ingredients i ON i.id = mfi.ingredient_id
        WHERE mfi.profile_id = ${profileId} AND mfi.date = ${date}
        ORDER BY mfi.meal_slot, mfi.created_at ASC
      `;
    }

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Foods GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar alimentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, date, mealSlot, ingredientId, customName, quantity, unit, proteinG, carbG, fatG, fiberG, calories } = body;

    if (!profileId || !date || !mealSlot || !quantity) {
      return NextResponse.json({ error: 'Campos obrigatórios: profileId, date, mealSlot, quantity' }, { status: 400 });
    }

    if (!ingredientId && !customName) {
      return NextResponse.json({ error: 'ingredientId ou customName obrigatório' }, { status: 400 });
    }

    const result = await vercelSql`
      INSERT INTO meal_food_items (profile_id, date, meal_slot, ingredient_id, custom_name, quantity, unit, protein_g, carb_g, fat_g, fiber_g, calories)
      VALUES (${profileId}, ${date}, ${mealSlot}, ${ingredientId ?? null}, ${customName ?? null}, ${quantity}, ${unit ?? 'g'}, ${proteinG}, ${carbG}, ${fatG}, ${fiberG ?? 0}, ${calories})
      RETURNING *
    `;

    await recalculateMealTotals(profileId, date, mealSlot);

    const items = await vercelSql`
      SELECT mfi.*, i.name_pt as ingredient_name
      FROM meal_food_items mfi
      LEFT JOIN ingredients i ON i.id = mfi.ingredient_id
      WHERE mfi.profile_id = ${profileId} AND mfi.date = ${date} AND mfi.meal_slot = ${mealSlot}
      ORDER BY mfi.created_at ASC
    `;

    return NextResponse.json({ data: { item: result.rows[0], items: items.rows } });
  } catch (error) {
    console.error('Foods POST error:', error);
    return NextResponse.json({ error: 'Erro ao adicionar alimento' }, { status: 500 });
  }
}

async function recalculateMealTotals(profileId: string, date: string, mealSlot: string) {
  const totals = await vercelSql`
    SELECT
      COALESCE(SUM(protein_g), 0) as total_protein,
      COALESCE(SUM(carb_g), 0) as total_carb,
      COALESCE(SUM(fat_g), 0) as total_fat,
      COALESCE(SUM(fiber_g), 0) as total_fiber,
      COALESCE(SUM(calories), 0) as total_calories
    FROM meal_food_items
    WHERE profile_id = ${profileId} AND date = ${date} AND meal_slot = ${mealSlot}
  `;

  const t = totals.rows[0];

  await vercelSql`
    INSERT INTO daily_nutrition_logs (profile_id, date, meal_slot, checked, protein_g, carb_g, fat_g, fiber_g, calories)
    VALUES (${profileId}, ${date}, ${mealSlot}, true, ${t.total_protein}, ${t.total_carb}, ${t.total_fat}, ${t.total_fiber}, ${t.total_calories})
    ON CONFLICT (profile_id, date, meal_slot)
    DO UPDATE SET
      checked = true,
      protein_g = ${t.total_protein},
      carb_g = ${t.total_carb},
      fat_g = ${t.total_fat},
      fiber_g = ${t.total_fiber},
      calories = ${t.total_calories}
  `;
}
