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

const SLOT_LABELS: Record<string, string> = {
  post_workout: 'Pos-treino',
  lunch: 'Almoco',
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
  const [showReset, setShowReset] = useState(false);
  const [showExport, setShowExport] = useState(false);

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

  async function handleReset() {
    if (!cycle) return;
    await fetch(`/api/cycles/${cycle.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    setCycle(null);
    setShowReset(false);
    setSelectedDay(null);
  }

  function exportShoppingList() {
    if (!cycle) return;
    const dishes = new Map<string, { slots: string[]; portions: number[] }>();
    for (const a of cycle.assignments) {
      const key = a.dish.name;
      if (!dishes.has(key)) dishes.set(key, { slots: [], portions: [] });
      const d = dishes.get(key)!;
      if (!d.slots.includes(SLOT_LABELS[a.mealSlot] ?? a.mealSlot)) d.slots.push(SLOT_LABELS[a.mealSlot] ?? a.mealSlot);
      d.portions.push(Number(a.portionMultiplier));
    }

    let text = `Cardapio - Ciclo ${cycle.startDate} a ${cycle.endDate}\n\n`;
    text += `PRATOS DO CICLO:\n`;
    for (const [name, info] of dishes) {
      text += `  - ${name} (${info.slots.join(', ')})\n`;
    }
    text += `\nTotal: ${dishes.size} pratos diferentes\n`;
    navigator.clipboard?.writeText(text);
  }

  function exportCookList() {
    if (!cycle) return;
    const dishes = new Map<string, number>();
    for (const a of cycle.assignments) {
      dishes.set(a.dish.name, (dishes.get(a.dish.name) ?? 0) + 1);
    }

    let text = `Lista para Cozinheira\nCiclo: ${cycle.startDate} a ${cycle.endDate}\n\n`;
    for (const [name, count] of dishes) {
      text += `  - ${name} (${count} porcoes)\n`;
    }
    navigator.clipboard?.writeText(text);
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
          <h2 className="text-lg font-semibold mb-2">Planejamento de cardapio</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">Gere um ciclo de 15 dias com pratos variados e porcoes personalizadas para toda a familia.</p>
          <Button onClick={handleGenerate} disabled={generating} className="w-full max-w-xs">
            {generating ? 'Gerando...' : 'Gerar cardapio'}
          </Button>
        </div>
      </PageContainer>
    );
  }

  const days = Array.from({ length: 15 }, (_, i) => i + 1);
  const dayAssignments = selectedDay
    ? cycle.assignments.filter(a => a.dayNumber === selectedDay)
    : [];

  if (selectedDay === null) {
    setSelectedDay(1);
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Cardapio</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            <Badge color={cycle.status === 'active' ? '#34C759' : '#FF9500'} className="mr-1">
              {cycle.status === 'draft' ? 'Rascunho' : 'Ativo'}
            </Badge>
            {cycle.startDate} — {cycle.endDate}
          </p>
        </div>
        <button onClick={() => setShowReset(true)} className="text-sm text-[#FF3B30] font-medium">Resetar</button>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {days.map(d => {
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
                  P: {Math.round(Number(meal.proteinG))}g · C: {Math.round(Number(meal.carbG))}g · G: {Math.round(Number(meal.fatG))}g · {Math.round(Number(meal.calories))} kcal
                </p>
              </div>
              <Badge color="#007AFF">
                {Math.round(Number(meal.portionMultiplier) * 100)}%
              </Badge>
            </div>
          </Card>
        );
      })}

      <div className="mt-6 space-y-3">
        {cycle.status === 'draft' && (
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Gerando...' : 'Regenerar'}
            </Button>
            <Button className="flex-1" onClick={handleFinalize}>Ativar ciclo</Button>
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" className="flex-1" onClick={exportShoppingList}>Copiar pratos</Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={exportCookList}>Lista cozinheira</Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => router.push('/compras')}>Compras</Button>
        </div>
      </div>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Resetar cardapio">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Isso vai arquivar o ciclo atual. Voce podera gerar um novo cardapio de 15 dias.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowReset(false)}>Cancelar</Button>
          <Button className="flex-1 !bg-[#FF3B30]" onClick={handleReset}>Resetar</Button>
        </div>
      </Modal>

      <Modal open={showExport} onClose={() => setShowExport(false)} title="Exportar">
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={() => { exportShoppingList(); setShowExport(false); }}>
            Copiar lista de pratos
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => { exportCookList(); setShowExport(false); }}>
            Copiar lista da cozinheira
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => { router.push('/compras'); setShowExport(false); }}>
            Ver lista de compras
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
