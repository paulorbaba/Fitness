import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modality = searchParams.get('modality');
    const muscleGroup = searchParams.get('muscle_group');
    const movementType = searchParams.get('movement_type');
    const search = searchParams.get('search');

    const conditions = [];
    if (modality) conditions.push(eq(schema.exercises.modality, modality));
    if (movementType) conditions.push(eq(schema.exercises.movementType, movementType));
    if (muscleGroup) conditions.push(sql`${muscleGroup} = ANY(${schema.exercises.primaryMuscles})`);
    if (search) conditions.push(sql`${schema.exercises.namePt} ILIKE ${'%' + search + '%'}`);

    const results = conditions.length > 0
      ? await db.select().from(schema.exercises).where(and(...conditions))
      : await db.select().from(schema.exercises);

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar exercícios' }, { status: 500 });
  }
}
