import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');

    if (!cycleId) return NextResponse.json({ error: 'cycleId obrigatório' }, { status: 400 });

    const items = await db.select({
      cache: schema.shoppingListCache,
      ingredient: schema.ingredients,
    }).from(schema.shoppingListCache)
      .innerJoin(schema.ingredients, eq(schema.shoppingListCache.ingredientId, schema.ingredients.id))
      .where(eq(schema.shoppingListCache.cycleId, parseInt(cycleId)));

    const data = items.map(row => ({
      id: row.cache.id,
      ingredient_name: row.ingredient.namePt,
      total_quantity_g: Number(row.cache.totalQuantityG),
      store_section: row.cache.storeSection,
      unit: row.ingredient.unit ?? 'g',
      checked: row.cache.checked ?? false,
    }));

    data.sort((a, b) => a.store_section.localeCompare(b.store_section) || a.ingredient_name.localeCompare(b.ingredient_name));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar lista de compras' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, checked } = body;

    if (!itemId) return NextResponse.json({ error: 'itemId obrigatório' }, { status: 400 });

    await db.update(schema.shoppingListCache)
      .set({ checked })
      .where(eq(schema.shoppingListCache.id, itemId));

    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}
