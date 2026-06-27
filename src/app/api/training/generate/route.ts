import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { generateTrainingSession } from '@/engine/training-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, modality, focus, targetMuscleGroups } = body;

    if (!profileId || !modality || !focus || !targetMuscleGroups?.length) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: profileId, modality, focus, targetMuscleGroups' }, { status: 400 });
    }

    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, profileId));
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekSessions = await db.select().from(schema.trainingSessions).where(
      and(
        eq(schema.trainingSessions.profileId, profileId),
        gte(schema.trainingSessions.date, weekStart.toISOString().split('T')[0]),
        lte(schema.trainingSessions.date, weekEnd.toISOString().split('T')[0]),
      )
    );

    const exercisePool = await db.select().from(schema.exercises).where(eq(schema.exercises.modality, modality));
    const weightliftingPool = modality !== 'weightlifting'
      ? await db.select().from(schema.exercises).where(eq(schema.exercises.modality, 'weightlifting'))
      : [];

    const dateStr = today.toISOString().split('T')[0];
    const blocks = generateTrainingSession({
      profileName: profile.name,
      profileId,
      modality,
      focus,
      targetMuscleGroups,
      date: dateStr,
      weekHistory: weekSessions.map(s => ({
        date: String(s.date),
        modality: s.modality,
        muscle_groups: s.muscleGroups,
        focus: s.focus,
      })),
      availableExercises: [...exercisePool, ...weightliftingPool].map(e => ({
        id: e.id,
        name: e.name,
        modality: e.modality,
        primary_muscles: e.primaryMuscles,
        secondary_muscles: e.secondaryMuscles ?? [],
        movement_type: e.movementType ?? 'compound',
        equipment: e.equipment ?? [],
        tags: e.tags ?? [],
      })),
    });

    const [session] = await db.insert(schema.trainingSessions).values({
      profileId,
      date: dateStr,
      modality,
      focus,
      muscleGroups: targetMuscleGroups,
      status: 'planned',
      durationMin: 60,
    }).returning();

    const exerciseInserts = blocks.flatMap(block =>
      block.exercises.map(ex => ({
        sessionId: session.id,
        exerciseId: ex.exercise_id,
        blockType: ex.block_type,
        orderIndex: ex.order_index,
        prescribedSets: ex.prescribed_sets,
        prescribedReps: String(ex.prescribed_reps),
        prescribedRpe: String(ex.prescribed_rpe),
        restSeconds: ex.rest_seconds,
        intensityTechnique: ex.intensity_technique ?? null,
        toFailure: ex.to_failure,
        notes: ex.notes ?? null,
      }))
    );

    if (exerciseInserts.length > 0) {
      await db.insert(schema.sessionExercises).values(exerciseInserts);
    }

    return NextResponse.json({ data: { session, blocks } }, { status: 201 });
  } catch (error) {
    console.error('Training generation error:', error);
    return NextResponse.json({ error: 'Erro ao gerar treino' }, { status: 500 });
  }
}
