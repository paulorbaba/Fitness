import { NextResponse } from 'next/server';
import { sql as vercelSql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const date = searchParams.get('date');

    if (!profileId || !date) {
      return NextResponse.json({ error: 'profileId e date obrigatórios' }, { status: 400 });
    }

    const meals = await vercelSql`
      SELECT * FROM daily_nutrition_logs
      WHERE profile_id = ${profileId} AND date = ${date}
      ORDER BY CASE meal_slot
        WHEN 'breakfast' THEN 1
        WHEN 'lunch' THEN 2
        WHEN 'snack' THEN 3
        WHEN 'dinner' THEN 4
      END
    `;

    const hydration = await vercelSql`
      SELECT * FROM hydration_logs
      WHERE profile_id = ${profileId} AND date = ${date}
      LIMIT 1
    `;

    return NextResponse.json({
      data: {
        meals: meals.rows,
        hydration: hydration.rows[0] ?? null,
      },
    });
  } catch (error) {
    console.error('Tracker GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar tracker' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, date, mealSlot, checked, proteinG, carbG, fatG, fiberG, calories, notes } = body;

    if (!profileId || !date || !mealSlot) {
      return NextResponse.json({ error: 'profileId, date e mealSlot obrigatórios' }, { status: 400 });
    }

    await vercelSql`
      INSERT INTO daily_nutrition_logs (profile_id, date, meal_slot, checked, protein_g, carb_g, fat_g, fiber_g, calories, notes)
      VALUES (${profileId}, ${date}, ${mealSlot}, ${checked ?? false}, ${proteinG ?? null}, ${carbG ?? null}, ${fatG ?? null}, ${fiberG ?? null}, ${calories ?? null}, ${notes ?? null})
      ON CONFLICT (profile_id, date, meal_slot)
      DO UPDATE SET
        checked = EXCLUDED.checked,
        protein_g = EXCLUDED.protein_g,
        carb_g = EXCLUDED.carb_g,
        fat_g = EXCLUDED.fat_g,
        fiber_g = EXCLUDED.fiber_g,
        calories = EXCLUDED.calories,
        notes = EXCLUDED.notes
    `;

    return NextResponse.json({ data: { saved: true } });
  } catch (error) {
    console.error('Tracker POST error:', error);
    return NextResponse.json({ error: 'Erro ao salvar tracker' }, { status: 500 });
  }
}
