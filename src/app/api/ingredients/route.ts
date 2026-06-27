import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const conditions = [];
    if (category) conditions.push(eq(schema.ingredients.category, category));
    if (search) conditions.push(sql`${schema.ingredients.namePt} ILIKE ${'%' + search + '%'}`);

    const results = conditions.length > 0
      ? await db.select().from(schema.ingredients).where(and(...conditions))
      : await db.select().from(schema.ingredients);

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ingredientes' }, { status: 500 });
  }
}
