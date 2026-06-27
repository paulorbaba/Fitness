import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, ne, and } from 'drizzle-orm';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cycleId = parseInt(id);

    await db.update(schema.menuCycles)
      .set({ status: 'completed' })
      .where(and(eq(schema.menuCycles.status, 'active'), ne(schema.menuCycles.id, cycleId)));

    const [updated] = await db.update(schema.menuCycles)
      .set({ status: 'active', finalizedAt: new Date() })
      .where(eq(schema.menuCycles.id, cycleId))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });

    const assignments = await db.select({
      a: schema.dailyMealAssignments,
    }).from(schema.dailyMealAssignments)
      .where(eq(schema.dailyMealAssignments.cycleId, cycleId));

    const dishIds = [...new Set(assignments.map(a => a.a.dishId))];

    await db.delete(schema.shoppingListCache).where(eq(schema.shoppingListCache.cycleId, cycleId));

    for (const dishId of dishIds) {
      if (!dishId) continue;
      const dishIngs = await db.select({
        di: schema.dishIngredients,
        ing: schema.ingredients,
      }).from(schema.dishIngredients)
        .innerJoin(schema.ingredients, eq(schema.dishIngredients.ingredientId, schema.ingredients.id))
        .where(eq(schema.dishIngredients.dishId, dishId));

      for (const row of dishIngs) {
        const totalPortions = assignments
          .filter(a => a.a.dishId === dishId)
          .reduce((sum, a) => sum + Number(a.a.portionMultiplier), 0);

        const totalQty = Number(row.di.quantityG) * totalPortions;

        const existing = await db.select().from(schema.shoppingListCache)
          .where(and(
            eq(schema.shoppingListCache.cycleId, cycleId),
            eq(schema.shoppingListCache.ingredientId, row.ing.id),
          ));

        if (existing.length > 0) {
          await db.update(schema.shoppingListCache)
            .set({ totalQuantityG: String(Number(existing[0].totalQuantityG) + totalQty) })
            .where(eq(schema.shoppingListCache.id, existing[0].id));
        } else {
          await db.insert(schema.shoppingListCache).values({
            cycleId,
            ingredientId: row.ing.id,
            totalQuantityG: String(Math.round(totalQty)),
            storeSection: row.ing.storeSection,
            checked: false,
          });
        }
      }
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Finalize error:', error);
    return NextResponse.json({ error: 'Erro ao finalizar ciclo' }, { status: 500 });
  }
}
