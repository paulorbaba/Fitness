import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cycleId = parseInt(id);

    const [cycle] = await db.select().from(schema.menuCycles).where(eq(schema.menuCycles.id, cycleId));
    if (!cycle) return NextResponse.json({ error: 'Ciclo não encontrado' }, { status: 404 });

    const assignments = await db.select({
      assignment: schema.dailyMealAssignments,
      dish: schema.dishes,
    }).from(schema.dailyMealAssignments)
      .innerJoin(schema.dishes, eq(schema.dailyMealAssignments.dishId, schema.dishes.id))
      .where(eq(schema.dailyMealAssignments.cycleId, cycleId))
      .orderBy(schema.dailyMealAssignments.dayNumber);

    return NextResponse.json({
      data: { ...cycle, assignments: assignments.map(a => ({ ...a.assignment, dish: a.dish })) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ciclo' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(schema.menuCycles)
      .set({ ...(body.status && { status: body.status }) })
      .where(eq(schema.menuCycles.id, parseInt(id)))
      .returning();
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar ciclo' }, { status: 500 });
  }
}
