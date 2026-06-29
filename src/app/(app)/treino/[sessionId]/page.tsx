'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';

const BLOCK_LABELS: Record<string, { label: string; color: string }> = {
  warmup: { label: 'Aquecimento', color: 'var(--color-warmup)' },
  main: { label: 'Principal', color: 'var(--color-strength)' },
  accessory: { label: 'Acessório', color: 'var(--color-hypertrophy)' },
  finisher: { label: 'Finalizador', color: 'var(--color-finisher)' },
};

const MODALITY_LABELS: Record<string, string> = {
  crossfit: 'CrossFit',
  hyrox: 'Hyrox',
  swimming: 'Natação',
  weightlifting: 'Musculação',
};

interface ExerciseLog {
  id: number;
  setNumber: number;
  actualReps: number | null;
  actualWeightKg: string | null;
  rpe: string | null;
  completed: boolean;
}

interface SessionExercise {
  id: number;
  exerciseId: number;
  blockType: string;
  orderIndex: number;
  prescribedSets: number | null;
  prescribedReps: string | null;
  prescribedRpe: string | null;
  restSeconds: number | null;
  intensityTechnique: string | null;
  toFailure: boolean;
  notes: string | null;
  exercise: {
    id: number;
    name: string;
    namePt: string;
    primaryMuscles: string[];
    executionTips: string | null;
    videoUrl: string | null;
  };
  logs: ExerciseLog[];
}

interface Session {
  id: number;
  modality: string;
  focus: string;
  muscleGroups: string[];
  status: string;
  date: string;
  exercises: SessionExercise[];
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState<{ exerciseId: number; setNumber: number } | null>(null);
  const [logReps, setLogReps] = useState('');
  const [logWeight, setLogWeight] = useState('');
  const [logRpe, setLogRpe] = useState('');
  const [tipsOpen, setTipsOpen] = useState<number | null>(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  async function fetchSession() {
    const res = await fetch(`/api/training/sessions/${sessionId}`);
    const json = await res.json();
    setSession(json.data ?? null);
    setLoading(false);
  }

  async function startSession() {
    await fetch(`/api/training/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    await fetchSession();
  }

  async function completeSession() {
    await fetch(`/api/training/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    await fetchSession();
  }

  async function logSet() {
    if (!logModal) return;
    await fetch(`/api/training/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: {
          session_exercise_id: logModal.exerciseId,
          set_number: logModal.setNumber,
          actual_reps: logReps ? parseInt(logReps) : null,
          actual_weight_kg: logWeight ? parseFloat(logWeight) : null,
          rpe: logRpe ? parseFloat(logRpe) : null,
          completed: true,
        },
      }),
    });
    setLogModal(null);
    setLogReps('');
    setLogWeight('');
    setLogRpe('');
    await fetchSession();
  }

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-6" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28 mb-3" />)}
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer>
        <p className="text-center text-[var(--color-text-secondary)] mt-20">Sessão não encontrada</p>
      </PageContainer>
    );
  }

  const blocks = ['warmup', 'main', 'accessory', 'finisher'];
  const groupedExercises = blocks
    .map(b => ({
      block: b,
      ...BLOCK_LABELS[b],
      exercises: session.exercises.filter(e => e.blockType === b).sort((a, c) => a.orderIndex - c.orderIndex),
    }))
    .filter(b => b.exercises.length > 0);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">{MODALITY_LABELS[session.modality] ?? session.modality}</h1>
        <Badge color={session.status === 'completed' ? 'var(--color-success)' : session.status === 'in_progress' ? 'var(--color-warning)' : 'var(--color-action)'}>
          {session.status === 'completed' ? 'Concluído' : session.status === 'in_progress' ? 'Em andamento' : 'Planejado'}
        </Badge>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] capitalize mb-1">{session.focus}</p>
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {session.muscleGroups.map(g => <Badge key={g} color="var(--color-text-tertiary)">{g}</Badge>)}
      </div>

      {session.status === 'planned' && (
        <Button className="w-full mb-6" onClick={startSession}>Iniciar treino</Button>
      )}

      {groupedExercises.map(group => (
        <div key={group.block} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: group.color }}>
              {group.label}
            </h2>
          </div>

          <div className="space-y-3">
            {group.exercises.map(ex => {
              const totalSets = ex.prescribedSets ?? 3;
              const loggedSets = ex.logs.length;
              return (
                <Card key={ex.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{ex.exercise.namePt}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {totalSets} x {ex.prescribedReps ?? '?'} reps
                        {ex.prescribedRpe && ` @ RPE ${ex.prescribedRpe}`}
                        {ex.restSeconds && ` · ${ex.restSeconds}s desc.`}
                      </p>
                      {ex.intensityTechnique && (
                        <Badge color="var(--color-finisher)" className="mt-1">{ex.intensityTechnique.replace(/_/g, ' ')}</Badge>
                      )}
                      {ex.toFailure && <Badge color="var(--color-error)" className="mt-1 ml-1">Falha</Badge>}
                    </div>
                    <div className="flex gap-2">
                      {ex.exercise.executionTips && (
                        <button
                          onClick={() => setTipsOpen(tipsOpen === ex.id ? null : ex.id)}
                          className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-xs"
                        >
                          ?
                        </button>
                      )}
                      {ex.exercise.videoUrl && (
                        <a
                          href={ex.exercise.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-xs"
                        >
                          ▶
                        </a>
                      )}
                    </div>
                  </div>

                  {tipsOpen === ex.id && ex.exercise.executionTips && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 p-2 bg-[var(--color-bg-secondary)] rounded-lg">
                      {ex.exercise.executionTips}
                    </p>
                  )}

                  {session.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: totalSets }, (_, i) => {
                          const log = ex.logs.find(l => l.setNumber === i + 1);
                          return (
                            <button
                              key={i}
                              onClick={() => !log && setLogModal({ exerciseId: ex.id, setNumber: i + 1 })}
                              className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all ${
                                log
                                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                              }`}
                            >
                              {log ? `${log.actualReps ?? '-'}x${log.actualWeightKg ?? '-'}kg` : `Set ${i + 1}`}
                            </button>
                          );
                        })}
                      </div>
                      <div className="h-1 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-success)] rounded-full transition-all"
                          style={{ width: `${(loggedSets / totalSets) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {session.status === 'completed' && ex.logs.length > 0 && (
                    <div className="mt-3 flex gap-1">
                      {ex.logs.map(log => (
                        <span key={log.id} className="text-xs px-2 py-1 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)]">
                          {log.actualReps ?? '-'}x{log.actualWeightKg ?? '-'}kg
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {session.status === 'in_progress' && (
        <Button className="w-full mt-4" onClick={completeSession}>Finalizar treino</Button>
      )}

      <Modal open={!!logModal} onClose={() => setLogModal(null)} title="Registrar set">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Repetições</label>
            <input
              type="number"
              value={logReps}
              onChange={e => setLogReps(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              placeholder="12"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Peso (kg)</label>
            <input
              type="number"
              step="0.5"
              value={logWeight}
              onChange={e => setLogWeight(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              placeholder="20"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">RPE (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={logRpe}
              onChange={e => setLogRpe(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              placeholder="8"
            />
          </div>
          <Button className="w-full" onClick={logSet}>Salvar</Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
