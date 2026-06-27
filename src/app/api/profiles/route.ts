import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';

export async function GET() {
  try {
    const profiles = await db.select().from(schema.profiles);
    return NextResponse.json({ data: profiles });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar perfis' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [profile] = await db.insert(schema.profiles).values({
      name: body.name,
      age: body.age,
      weightKg: body.weight_kg,
      heightM: body.height_m,
      goal: body.goal,
      trainingIntensity: body.training_intensity,
      proteinTargetG: body.protein_target_g,
      carbTargetG: body.carb_target_g,
      carbTargetLowG: body.carb_target_low_g,
      fatTargetG: body.fat_target_g,
    }).returning();
    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 });
  }
}
