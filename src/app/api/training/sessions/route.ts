import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const weekOf = searchParams.get('weekOf');
    const date = searchParams.get('date');
    const modality = searchParams.get('modality');

    const conditions = [];
    if (profileId) conditions.push(eq(schema.trainingSessions.profileId, profileId));
    if (modality) conditions.push(eq(schema.trainingSessions.modality, modality));
    if (date) conditions.push(eq(schema.trainingSessions.date, date));

    if (weekOf) {
      const start = new Date(weekOf);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      conditions.push(gte(schema.trainingSessions.date, start.toISOString().split('T')[0]));
      conditions.push(lte(schema.trainingSessions.date, end.toISOString().split('T')[0]));
    }

    const sessions = conditions.length > 0
      ? await db.select().from(schema.trainingSessions).where(and(...conditions)).orderBy(desc(schema.trainingSessions.date))
      : await db.select().from(schema.trainingSessions).orderBy(desc(schema.trainingSessions.date)).limit(20);

    return NextResponse.json({ data: sessions });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sessões' }, { status: 500 });
  }
}
