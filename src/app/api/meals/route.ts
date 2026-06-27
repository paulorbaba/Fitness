import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const profileId = searchParams.get('profileId');
    const cycleId = searchParams.get('cycleId');

    const conditions = [];
    if (date) conditions.push(eq(schema.dailyMealAssignments.date, date));
    if (profileId) conditions.push(eq(schema.dailyMealAssignments.profileId, profileId));
    if (cycleId) conditions.push(eq(schema.dailyMealAssignments.cycleId, parseInt(cycleId)));

    if (conditions.length === 0) {
      return NextResponse.json({ error: 'Informe ao menos date ou profileId' }, { status: 400 });
    }

    const meals = await db.select({
      assignment: schema.dailyMealAssignments,
      dish: schema.dishes,
    }).from(schema.dailyMealAssignments)
      .innerJoin(schema.dishes, eq(schema.dailyMealAssignments.dishId, schema.dishes.id))
      .where(and(...conditions))
      .orderBy(schema.dailyMealAssignments.dayNumber);

    const data = meals.map(m => ({
      ...m.assignment,
      dish: m.dish,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar refeições' }, { status: 500 });
  }
}
