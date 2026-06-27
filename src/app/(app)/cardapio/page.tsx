'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';

const SLOT_LABELS: Record<string, string> = {
  post_workout: 'Pós-treino',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

const SLOT_ORDER = ['post_workout', 'lunch', 'snack', 'dinner'];

interface Assignment {
  id: number;
  dayNumber: number;
  date: string;
  mealSlot: string;
  portionMultiplier: string;
  proteinG: string;
  carbG: string;
  fatG: string;
  calories: string;
  isHighCarbDay: boolean;
  dish: { id: number; name: string };
}

interface CycleData {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  assignments: Assignment[];
}

export default function CardapioPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [cycle, setCycle] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetchCycle();
  }, [activeProfile]);

  async function fetchCycle() {
    setLoading(true);
    const res = await fetch(`/api/cycles/current?profileId=${activeProfile!.id}`);
    const json = await res.json();
    setCycle(json.data ?? null);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    await fetch('/api/cycles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    await fetchCycle();
    setGenerating(false);
  }

  async function handleFinalize() {
    if (!cycle) return;
    await fetch(`/api/cycles/${cycle.id}/finalize`, { method: 'POST' });
    await fetchCycle();
  }

  if (!activeProfile) return null;

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 15 }, (_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 mb-3" />)}
      </PageContainer>
    );
  }

  if (!cycle) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <h2 className="text-lg font-semibold mb-2">Nenhum ciclo de cardápio</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">Gere um ciclo de 15 dias com pratos variados e porções personalizadas.</p>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Gerar cardápio'}
          </Button>
        </div>
      </PageContainer>
    );
  }

  const days = Array.from({ length: 15 }, (_, i) => i + 1);
  const dayAssignments = selectedDay
    ? cycle.assignments.filter(a => a.dayNumber === selectedDay)
    : [];

  const today = new Date().toISOString().split('T')[0];
  const todayDay = cycle.assignments.find(a => a.date === today)?.dayNumber;

  if (selectedDay === null && todayDay) {
    setSelectedDay(todayDay);
  } else if (selectedDay === null) {
    setSelectedDay(1);
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Cardápio</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {cycle.status === 'draft' ? 'Rascunho' : 'Ativo'} &middot; {cycle.startDate} — {cycle.endDate}
          </p>
        </div>
        {cycle.status === 'draft' && (
          <Button size="sm" onClick={handleFinalize}>Ativar</Button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {days.map(d => {
          const isToday = d === todayDay;
          const isSelected = d === selectedDay;
          const dayMeals = cycle.assignments.filter(a => a.dayNumber === d);
          const isHighCarb = dayMeals.some(a => a.isHighCarbDay);
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`relative flex flex-col items-center justify-center h-12 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-[var(--color-action)] text-white'
                  : isToday
                    ? 'bg-[var(--color-action)]20 text-[var(--color-action)]'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
              }`}
            >
              <span>D{d}</span>
              {isHighCarb && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFB84D]" />}
            </button>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">
        Dia {selectedDay}
        {dayAssignments.some(a => a.isHighCarbDay) && (
          <Badge color="#FFB84D" className="ml-2">High Carb</Badge>
        )}
      </h2>

      {SLOT_ORDER.map(slot => {
        const meal = dayAssignments.find(a => a.mealSlot === slot);
        if (!meal) return null;
        return (
          <Card key={slot} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{SLOT_LABELS[slot]}</p>
                <p className="font-medium">{meal.dish.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  P: {Math.round(Number(meal.proteinG))}g &middot; C: {Math.round(Number(meal.carbG))}g &middot; G: {Math.round(Number(meal.fatG))}g &middot; {Math.round(Number(meal.calories))} kcal
                </p>
              </div>
              <Badge color="#007AFF">
                {Math.round(Number(meal.portionMultiplier) * 100)}%
              </Badge>
            </div>
          </Card>
        );
      })}

      {cycle.status === 'draft' && (
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Regenerar'}
          </Button>
          <Button className="flex-1" onClick={handleFinalize}>Ativar ciclo</Button>
        </div>
      )}
    </PageContainer>
  );
}
