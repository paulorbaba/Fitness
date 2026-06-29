import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { seed } from '@/db/seed';
import { EXPANDED_INGREDIENTS } from '@/db/seed/ingredients-expanded';
import { sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'expand') {
      let added = 0;
      for (const ing of EXPANDED_INGREDIENTS) {
        const existing = await db.select({ id: schema.ingredients.id })
          .from(schema.ingredients)
          .where(sql`${schema.ingredients.namePt} = ${ing.name_pt}`)
          .limit(1);

        if (existing.length === 0) {
          await db.insert(schema.ingredients).values({
            name: ing.name,
            namePt: ing.name_pt,
            category: ing.category,
            storeSection: ing.store_section,
            proteinPer100g: String(ing.protein_per_100g),
            carbPer100g: String(ing.carb_per_100g),
            fatPer100g: String(ing.fat_per_100g),
            fiberPer100g: String(ing.fiber_per_100g),
            caloriesPer100g: String(ing.calories_per_100g),
            allergenTags: [...ing.allergen_tags],
            unit: ing.unit,
            defaultPortionG: ing.default_portion_g,
            defaultPortionLabel: ing.default_portion_label,
          });
          added++;
        }
      }
      return NextResponse.json({ message: `Ingredientes expandidos: ${added} novos adicionados de ${EXPANDED_INGREDIENTS.length} totais.` });
    }

    const existing = await db.select().from(schema.profiles).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Banco já populado. Delete os dados primeiro se quiser re-seedar. Use ?mode=expand para adicionar novos ingredientes.' }, { status: 409 });
    }

    await seed();

    return NextResponse.json({ message: 'Seed concluído com sucesso!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro ao popular banco', details: String(error) }, { status: 500 });
  }
}
