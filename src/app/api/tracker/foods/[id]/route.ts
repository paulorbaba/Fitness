import { NextResponse } from 'next/server';
import { sql as vercelSql } from '@vercel/postgres';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const item = await vercelSql`
      SELECT profile_id, date, meal_slot FROM meal_food_items WHERE id = ${id}
    `;

    if (item.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    const { profile_id, date, meal_slot } = item.rows[0];

    await vercelSql`
      UPDATE meal_food_items
      SET quantity = ${body.quantity}, unit = ${body.unit},
          protein_g = ${body.proteinG}, carb_g = ${body.carbG},
          fat_g = ${body.fatG}, fiber_g = ${body.fiberG}, calories = ${body.calories}
      WHERE id = ${id}
    `;

    const totals = await vercelSql`
      SELECT
        COALESCE(SUM(protein_g), 0) as total_protein,
        COALESCE(SUM(carb_g), 0) as total_carb,
        COALESCE(SUM(fat_g), 0) as total_fat,
        COALESCE(SUM(fiber_g), 0) as total_fiber,
        COALESCE(SUM(calories), 0) as total_calories
      FROM meal_food_items
      WHERE profile_id = ${profile_id} AND date = ${date} AND meal_slot = ${meal_slot}
    `;

    const t = totals.rows[0];
    await vercelSql`
      INSERT INTO daily_nutrition_logs (profile_id, date, meal_slot, checked, protein_g, carb_g, fat_g, fiber_g, calories)
      VALUES (${profile_id}, ${date}, ${meal_slot}, true, ${t.total_protein}, ${t.total_carb}, ${t.total_fat}, ${t.total_fiber}, ${t.total_calories})
      ON CONFLICT (profile_id, date, meal_slot)
      DO UPDATE SET
        protein_g = ${t.total_protein},
        carb_g = ${t.total_carb},
        fat_g = ${t.total_fat},
        fiber_g = ${t.total_fiber},
        calories = ${t.total_calories}
    `;

    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    console.error('Foods PUT error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar alimento' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const item = await vercelSql`
      SELECT profile_id, date, meal_slot FROM meal_food_items WHERE id = ${id}
    `;

    if (item.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    const { profile_id, date, meal_slot } = item.rows[0];

    await vercelSql`DELETE FROM meal_food_items WHERE id = ${id}`;

    const totals = await vercelSql`
      SELECT
        COALESCE(SUM(protein_g), 0) as total_protein,
        COALESCE(SUM(carb_g), 0) as total_carb,
        COALESCE(SUM(fat_g), 0) as total_fat,
        COALESCE(SUM(fiber_g), 0) as total_fiber,
        COALESCE(SUM(calories), 0) as total_calories
      FROM meal_food_items
      WHERE profile_id = ${profile_id} AND date = ${date} AND meal_slot = ${meal_slot}
    `;

    const t = totals.rows[0];
    const hasItems = Number(t.total_protein) > 0 || Number(t.total_carb) > 0 || Number(t.total_fat) > 0;

    if (hasItems) {
      await vercelSql`
        INSERT INTO daily_nutrition_logs (profile_id, date, meal_slot, checked, protein_g, carb_g, fat_g, fiber_g, calories)
        VALUES (${profile_id}, ${date}, ${meal_slot}, true, ${t.total_protein}, ${t.total_carb}, ${t.total_fat}, ${t.total_fiber}, ${t.total_calories})
        ON CONFLICT (profile_id, date, meal_slot)
        DO UPDATE SET
          protein_g = ${t.total_protein},
          carb_g = ${t.total_carb},
          fat_g = ${t.total_fat},
          fiber_g = ${t.total_fiber},
          calories = ${t.total_calories}
      `;
    } else {
      await vercelSql`
        DELETE FROM daily_nutrition_logs
        WHERE profile_id = ${profile_id} AND date = ${date} AND meal_slot = ${meal_slot}
      `;
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Foods DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao remover alimento' }, { status: 500 });
  }
}
