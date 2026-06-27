import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    const [cycle] = await db.select().from(schema.menuCycles)
      .where(eq(schema.menuCycles.status, 'active'))
      .orderBy(desc(schema.menuCycles.startDate))
      .limit(1);

    if (!cycle) {
      const [draft] = await db.select().from(schema.menuCycles)
        .where(eq(schema.menuCycles.status, 'draft'))
        .orderBy(desc(schema.menuCycles.startDate))
        .limit(1);

      if (!draft) return NextResponse.json({ data: null });

      const conditions = [eq(schema.dailyMealAssignments.cycleId, draft.id)];
      if (profileId) conditions.push(eq(schema.dailyMealAssignments.profileId, profileId));

      const assignments = await db.select({
        assignment: schema.dailyMealAssignments,
        dish: schema.dishes,
      }).from(schema.dailyMealAssignments)
        .innerJoin(schema.dishes, eq(schema.dailyMealAssignments.dishId, schema.dishes.id))
        .where(and(...conditions))
        .orderBy(schema.dailyMealAssignments.dayNumber);

      return NextResponse.json({
        data: {
          ...draft,
          assignments: assignments.map(a => ({ ...a.assignment, dish: a.dish })),
        },
      });
    }

    const conditions = [eq(schema.dailyMealAssignments.cycleId, cycle.id)];
    if (profileId) conditions.push(eq(schema.dailyMealAssignments.profileId, profileId));

    const assignments = await db.select({
      assignment: schema.dailyMealAssignments,
      dish: schema.dishes,
    }).from(schema.dailyMealAssignments)
      .innerJoin(schema.dishes, eq(schema.dailyMealAssignments.dishId, schema.dishes.id))
      .where(and(...conditions))
      .orderBy(schema.dailyMealAssignments.dayNumber);

    return NextResponse.json({
      data: {
        ...cycle,
        assignments: assignments.map(a => ({ ...a.assignment, dish: a.dish })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ciclo atual' }, { status: 500 });
  }
}
