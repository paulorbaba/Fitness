import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    const [session] = await db.select().from(schema.trainingSessions).where(eq(schema.trainingSessions.id, sessionId));
    if (!session) return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });

    const exercisesRaw = await db.select({
      se: schema.sessionExercises,
      exercise: schema.exercises,
    }).from(schema.sessionExercises)
      .innerJoin(schema.exercises, eq(schema.sessionExercises.exerciseId, schema.exercises.id))
      .where(eq(schema.sessionExercises.sessionId, sessionId))
      .orderBy(schema.sessionExercises.orderIndex);

    const exercises = await Promise.all(
      exercisesRaw.map(async (row) => {
        const logs = await db.select().from(schema.sessionExerciseLogs)
          .where(eq(schema.sessionExerciseLogs.sessionExerciseId, row.se.id))
          .orderBy(schema.sessionExerciseLogs.setNumber);
        return { ...row.se, exercise: row.exercise, logs };
      })
    );

    return NextResponse.json({ data: { ...session, exercises } });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sessão' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    const body = await request.json();

    if (body.deleteLog) {
      await db.delete(schema.sessionExerciseLogs)
        .where(eq(schema.sessionExerciseLogs.id, body.deleteLog.logId));
      return NextResponse.json({ data: { deleted: true } });
    }

    if (body.updateLog) {
      const updates: Record<string, unknown> = {};
      if (body.updateLog.actualReps !== undefined) updates.actualReps = body.updateLog.actualReps;
      if (body.updateLog.actualWeightKg !== undefined) updates.actualWeightKg = String(body.updateLog.actualWeightKg);
      if (body.updateLog.rpe !== undefined) updates.rpe = body.updateLog.rpe ? String(body.updateLog.rpe) : null;
      await db.update(schema.sessionExerciseLogs)
        .set(updates)
        .where(eq(schema.sessionExerciseLogs.id, body.updateLog.logId));
      return NextResponse.json({ data: { updated: true } });
    }

    if (body.log) {
      await db.insert(schema.sessionExerciseLogs).values({
        sessionExerciseId: body.log.session_exercise_id,
        setNumber: body.log.set_number,
        actualReps: body.log.actual_reps,
        actualWeightKg: String(body.log.actual_weight_kg),
        rpe: body.log.rpe ? String(body.log.rpe) : null,
        completed: body.log.completed ?? true,
      });
      return NextResponse.json({ data: { logged: true } });
    }

    const [updated] = await db.update(schema.trainingSessions)
      .set({
        ...(body.status && { status: body.status }),
        ...(body.status === 'completed' && { completedAt: new Date() }),
        ...(body.notes && { notes: body.notes }),
      })
      .where(eq(schema.trainingSessions.id, sessionId))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar sessão' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    await db.delete(schema.trainingSessions)
      .where(eq(schema.trainingSessions.id, sessionId));

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao apagar sessão' }, { status: 500 });
  }
}
