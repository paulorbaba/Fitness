import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, or, sql, isNull } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const profileId = searchParams.get('profileId');

    const conditions = [];
    if (category) conditions.push(eq(schema.ingredients.category, category));
    if (search) conditions.push(sql`${schema.ingredients.namePt} ILIKE ${'%' + search + '%'}`);

    if (profileId) {
      conditions.push(
        or(
          eq(schema.ingredients.isCustom, false),
          isNull(schema.ingredients.isCustom),
          eq(schema.ingredients.createdBy, profileId),
        )!,
      );
    }

    const results = conditions.length > 0
      ? await db.select().from(schema.ingredients).where(and(...conditions)).limit(50)
      : await db.select().from(schema.ingredients).limit(50);

    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ingredientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, name, namePt, category, proteinPer100g, carbPer100g, fatPer100g, fiberPer100g, caloriesPer100g, unit, defaultPortionG, defaultPortionLabel } = body;

    if (!profileId || !namePt || proteinPer100g === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios: profileId, namePt, proteinPer100g' }, { status: 400 });
    }

    const [inserted] = await db.insert(schema.ingredients).values({
      name: name || namePt.toLowerCase().replace(/\s+/g, '_'),
      namePt,
      category: category || 'other',
      storeSection: 'other',
      proteinPer100g: String(proteinPer100g),
      carbPer100g: String(carbPer100g ?? 0),
      fatPer100g: String(fatPer100g ?? 0),
      fiberPer100g: String(fiberPer100g ?? 0),
      caloriesPer100g: String(caloriesPer100g ?? (proteinPer100g * 4 + (carbPer100g ?? 0) * 4 + (fatPer100g ?? 0) * 9)),
      unit: unit || 'g',
      defaultPortionG: defaultPortionG || 100,
      defaultPortionLabel: defaultPortionLabel || '100g',
      isCustom: true,
      createdBy: profileId,
    }).returning();

    return NextResponse.json({ data: inserted });
  } catch (error) {
    console.error('Ingredients POST error:', error);
    return NextResponse.json({ error: 'Erro ao criar alimento' }, { status: 500 });
  }
}
