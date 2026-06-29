import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { seed } from '@/db/seed';

export async function POST() {
  try {
    const existing = await db.select().from(schema.profiles).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Banco já populado. Delete os dados primeiro se quiser re-seedar.' }, { status: 409 });
    }

    await seed();

    return NextResponse.json({ message: 'Seed concluído com sucesso!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro ao popular banco', details: String(error) }, { status: 500 });
  }
}
