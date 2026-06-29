import { NextResponse } from 'next/server';
import { sql as vercelSql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, date, glasses, targetGlasses } = body;

    if (!profileId || !date) {
      return NextResponse.json({ error: 'profileId e date obrigatórios' }, { status: 400 });
    }

    await vercelSql`
      INSERT INTO hydration_logs (profile_id, date, glasses, target_glasses)
      VALUES (${profileId}, ${date}, ${glasses ?? 0}, ${targetGlasses ?? 8})
      ON CONFLICT (profile_id, date)
      DO UPDATE SET glasses = EXCLUDED.glasses, target_glasses = EXCLUDED.target_glasses
    `;

    return NextResponse.json({ data: { saved: true } });
  } catch (error) {
    console.error('Hydration POST error:', error);
    return NextResponse.json({ error: 'Erro ao salvar hidratação' }, { status: 500 });
  }
}
