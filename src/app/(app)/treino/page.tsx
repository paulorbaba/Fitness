'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';

const MODALITY_LABELS: Record<string, string> = {
  crossfit: 'CrossFit',
  hyrox: 'Hyrox',
  swimming: 'Natacao',
  weightlifting: 'Musculacao',
};

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

interface SessionData {
  id: number;
  date: string;
  modality: string;
  focus: string;
  muscleGroups: string[];
  status: string;
  durationMin: number | null;
}

export default function TreinoPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetchSessions();
  }, [activeProfile]);

  async function fetchSessions() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekOf = monday.toISOString().split('T')[0];

    const res = await fetch(`/api/training/sessions?profileId=${activeProfile!.id}&weekOf=${weekOf}`);
    const json = await res.json();
    setSessions(json.data ?? []);
    setLoading(false);
  }

  async function handleResetWeek() {
    setDeleting(true);
    const planned = sessions.filter(s => s.status === 'planned');
    for (const s of planned) {
      await fetch(`/api/training/sessions/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
    }
    setShowReset(false);
    setDeleting(false);
    await fetchSessions();
  }

  if (!activeProfile) return null;

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const todayStr = today.toISOString().split('T')[0];
  const plannedCount = sessions.filter(s => s.status === 'planned').length;

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-7 gap-1 mb-6">
          {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 mb-3" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Treino</h1>
        <div className="flex items-center gap-2">
          {plannedCount > 0 && (
            <button onClick={() => setShowReset(true)} className="text-sm text-[#FF3B30] font-medium">Resetar</button>
          )}
          <Button size="sm" onClick={() => router.push('/treino/gerar')}>Novo treino</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDays.map((dateStr, i) => {
          const daySessions = sessions.filter(s => s.date === dateStr);
          const isToday = dateStr === todayStr;
          const hasSession = daySessions.length > 0;
          const allCompleted = daySessions.length > 0 && daySessions.every(s => s.status === 'completed');
          return (
            <div
              key={dateStr}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-center ${
                isToday ? 'bg-[var(--color-action)]10 ring-1 ring-[var(--color-action)]' : 'bg-[var(--color-bg-secondary)]'
              }`}
            >
              <span className="text-[10px] text-[var(--color-text-tertiary)]">{DAY_LABELS[i]}</span>
              <span className={`text-sm font-medium mt-0.5 ${isToday ? 'text-[var(--color-action)]' : ''}`}>
                {new Date(dateStr + 'T12:00:00').getDate()}
              </span>
              {hasSession && (
                <span className={`mt-1 w-1.5 h-1.5 rounded-full ${allCompleted ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
              )}
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">Esta semana</h2>
      {sessions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-[var(--color-text-secondary)] mb-3">Nenhum treino esta semana</p>
          <button onClick={() => router.push('/treino/gerar')} className="text-[var(--color-action)] font-medium">
            Gerar treino
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.filter(s => s.status !== 'cancelled').map(s => {
            const sessionDate = new Date(s.date + 'T12:00:00');
            const dayLabel = DAY_LABELS[(sessionDate.getDay() + 6) % 7];
            return (
              <Card key={s.id} onClick={() => router.push(`/treino/${s.id}`)}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{MODALITY_LABELS[s.modality] ?? s.modality}</p>
                      <span className="text-xs text-[var(--color-text-tertiary)]">{dayLabel} {sessionDate.getDate()}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] capitalize mt-0.5">{s.focus}</p>
                  </div>
                  <Badge color={s.status === 'completed' ? '#34C759' : s.status === 'in_progress' ? '#FF9500' : '#007AFF'}>
                    {s.status === 'completed' ? 'Concluido' : s.status === 'in_progress' ? 'Em andamento' : 'Planejado'}
                  </Badge>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {s.muscleGroups.map(g => (
                    <Badge key={g} color="#787880">{g}</Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Resetar treinos">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Isso vai cancelar {plannedCount} treino(s) planejado(s) desta semana. Treinos ja concluidos ou em andamento nao serao afetados.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowReset(false)}>Cancelar</Button>
          <Button className="flex-1 !bg-[#FF3B30]" onClick={handleResetWeek} disabled={deleting}>
            {deleting ? 'Resetando...' : 'Resetar'}
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
