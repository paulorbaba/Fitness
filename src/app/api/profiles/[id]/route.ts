import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, id));
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const restrictions = await db.select().from(schema.foodRestrictions).where(eq(schema.foodRestrictions.profileId, id));
    const preferences = await db.select().from(schema.trainingPreferences).where(eq(schema.trainingPreferences.profileId, id));

    return NextResponse.json({ data: { ...profile, restrictions, preferences } });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const [updated] = await db.update(schema.profiles)
      .set({
        ...(body.weight_kg && { weightKg: body.weight_kg }),
        ...(body.height_m && { heightM: body.height_m }),
        ...(body.protein_target_g && { proteinTargetG: body.protein_target_g }),
        ...(body.carb_target_g && { carbTargetG: body.carb_target_g }),
        ...(body.carb_target_low_g !== undefined && { carbTargetLowG: body.carb_target_low_g }),
        ...(body.fat_target_g && { fatTargetG: body.fat_target_g }),
        ...(body.goal && { goal: body.goal }),
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, id))
      .returning();
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
