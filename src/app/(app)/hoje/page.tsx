'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Cafe da manhã', icon: '☀️' },
  { key: 'lunch', label: 'Almoço', icon: '🍽️' },
  { key: 'snack', label: 'Lanche', icon: '🍎' },
  { key: 'dinner', label: 'Jantar', icon: '🌙' },
];

interface MealLog {
  meal_slot: string;
  checked: boolean;
  protein_g: number | null;
  carb_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  calories: number | null;
  notes: string | null;
}

interface HydrationData {
  glasses: number;
  target_glasses: number;
}

interface SessionData {
  id: number;
  modality: string;
  focus: string;
  muscleGroups: string[];
  status: string;
}

const MODALITY_LABELS: Record<string, string> = {
  crossfit: 'CrossFit',
  hyrox: 'Hyrox',
  swimming: 'Natação',
  weightlifting: 'Musculação',
};

export default function HojePage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [hydration, setHydration] = useState<HydrationData>({ glasses: 0, target_glasses: 8 });
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ proteinG: '', carbG: '', fatG: '', fiberG: '', calories: '', notes: '' });

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    const [trackerRes, sessionsRes] = await Promise.all([
      fetch(`/api/tracker?profileId=${activeProfile.id}&date=${today}`).then(r => r.json()),
      fetch(`/api/training/sessions?date=${today}&profileId=${activeProfile.id}`).then(r => r.json()),
    ]);
    setMeals(trackerRes.data?.meals ?? []);
    setHydration(trackerRes.data?.hydration ?? { glasses: 0, target_glasses: 8 });
    setSessions(sessionsRes.data ?? []);
    setLoading(false);
  }, [activeProfile, today]);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetchData();
  }, [activeProfile, fetchData]);

  async function toggleMeal(slot: string) {
    const existing = meals.find(m => m.meal_slot === slot);
    const newChecked = !(existing?.checked ?? false);

    setMeals(prev => {
      const rest = prev.filter(m => m.meal_slot !== slot);
      return [...rest, { ...(existing ?? { meal_slot: slot, protein_g: null, carb_g: null, fat_g: null, fiber_g: null, calories: null, notes: null }), checked: newChecked }];
    });

    await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: activeProfile!.id,
        date: today,
        mealSlot: slot,
        checked: newChecked,
        proteinG: existing?.protein_g,
        carbG: existing?.carb_g,
        fatG: existing?.fat_g,
        fiberG: existing?.fiber_g,
        calories: existing?.calories,
        notes: existing?.notes,
      }),
    });
  }

  function openEdit(slot: string) {
    const existing = meals.find(m => m.meal_slot === slot);
    setForm({
      proteinG: existing?.protein_g ? String(existing.protein_g) : '',
      carbG: existing?.carb_g ? String(existing.carb_g) : '',
      fatG: existing?.fat_g ? String(existing.fat_g) : '',
      fiberG: existing?.fiber_g ? String(existing.fiber_g) : '',
      calories: existing?.calories ? String(existing.calories) : '',
      notes: existing?.notes ?? '',
    });
    setEditSlot(slot);
  }

  async function saveMealDetail() {
    if (!editSlot) return;
    const existing = meals.find(m => m.meal_slot === editSlot);

    await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: activeProfile!.id,
        date: today,
        mealSlot: editSlot,
        checked: existing?.checked ?? true,
        proteinG: form.proteinG ? parseFloat(form.proteinG) : null,
        carbG: form.carbG ? parseFloat(form.carbG) : null,
        fatG: form.fatG ? parseFloat(form.fatG) : null,
        fiberG: form.fiberG ? parseFloat(form.fiberG) : null,
        calories: form.calories ? parseFloat(form.calories) : null,
        notes: form.notes || null,
      }),
    });
    setEditSlot(null);
    await fetchData();
  }

  async function addWater() {
    const newGlasses = hydration.glasses + 1;
    setHydration(prev => ({ ...prev, glasses: newGlasses }));
    await fetch('/api/tracker/hydration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: activeProfile!.id, date: today, glasses: newGlasses, targetGlasses: hydration.target_glasses }),
    });
  }

  async function removeWater() {
    if (hydration.glasses <= 0) return;
    const newGlasses = hydration.glasses - 1;
    setHydration(prev => ({ ...prev, glasses: newGlasses }));
    await fetch('/api/tracker/hydration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: activeProfile!.id, date: today, glasses: newGlasses, targetGlasses: hydration.target_glasses }),
    });
  }

  if (!activeProfile) return null;

  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + Number(m.protein_g || 0),
      carbs: acc.carbs + Number(m.carb_g || 0),
      fat: acc.fat + Number(m.fat_g || 0),
      fiber: acc.fiber + Number(m.fiber_g || 0),
      calories: acc.calories + Number(m.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 }
  );

  const fatTarget = activeProfile.fat_target_g ?? 80;
  const targetCalories = activeProfile.protein_target_g * 4 + activeProfile.carb_target_g * 4 + fatTarget * 9;
  const checkedCount = meals.filter(m => m.checked).length;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-around mb-6 mt-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-[72px] h-[72px] rounded-full" />)}
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 mb-3" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-around mb-6 mt-2">
        <ProgressRing value={totals.protein} max={activeProfile.protein_target_g} color="#FF6B6B" label="Proteina" />
        <ProgressRing value={totals.carbs} max={activeProfile.carb_target_g} color="#FFB84D" label="Carbos" />
        <ProgressRing value={totals.fat} max={fatTarget} color="#4ECDC4" label="Gordura" />
        <ProgressRing value={totals.calories} max={targetCalories} color="#95E1D3" label="Calorias" unit="kcal" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Refeicoes</h2>
        <span className="text-sm text-[var(--color-text-secondary)]">{checkedCount}/4</span>
      </div>

      <div className="space-y-3 mb-6">
        {MEAL_SLOTS.map(slot => {
          const log = meals.find(m => m.meal_slot === slot.key);
          const isChecked = log?.checked ?? false;
          const hasMacros = log && (log.protein_g || log.carb_g || log.fat_g);
          return (
            <Card key={slot.key} className={isChecked ? 'ring-1 ring-[#34C759]' : ''}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMeal(slot.key)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked ? 'bg-[#34C759] border-[#34C759]' : 'border-[var(--color-separator)]'
                  }`}
                >
                  {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <div className="flex-1" onClick={() => openEdit(slot.key)}>
                  <div className="flex items-center gap-2">
                    <span>{slot.icon}</span>
                    <p className="font-medium">{slot.label}</p>
                  </div>
                  {hasMacros ? (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      P: {Math.round(Number(log.protein_g || 0))}g · C: {Math.round(Number(log.carb_g || 0))}g · G: {Math.round(Number(log.fat_g || 0))}g
                      {log.calories ? ` · ${Math.round(Number(log.calories))} kcal` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Toque para registrar macros</p>
                  )}
                  {log?.notes && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 italic">{log.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">Hidratacao</h2>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div>
              <p className="font-medium">{hydration.glasses} / {hydration.target_glasses} copos</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                ~{hydration.glasses * 250}ml de {hydration.target_glasses * 250}ml
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeWater}
              className="w-9 h-9 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg font-bold"
            >
              -
            </button>
            <button
              onClick={addWater}
              className="w-9 h-9 rounded-full bg-[var(--color-action)] text-white flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-3 h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5AC8FA] rounded-full transition-all"
            style={{ width: `${Math.min((hydration.glasses / hydration.target_glasses) * 100, 100)}%` }}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Treino de hoje</h2>
        <button onClick={() => router.push('/treino/gerar')} className="text-sm text-[var(--color-action)] font-medium">Novo</button>
      </div>
      {sessions.length === 0 ? (
        <Card className="text-center py-6">
          <p className="text-[var(--color-text-secondary)]">Nenhum treino para hoje</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Card key={s.id} onClick={() => router.push(`/treino/${s.id}`)}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{MODALITY_LABELS[s.modality] ?? s.modality}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] capitalize">{s.focus}</p>
                </div>
                <Badge color={s.status === 'completed' ? '#34C759' : s.status === 'in_progress' ? '#FF9500' : '#007AFF'}>
                  {s.status === 'completed' ? 'Concluido' : s.status === 'in_progress' ? 'Em andamento' : 'Planejado'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editSlot} onClose={() => setEditSlot(null)} title={`Registrar ${MEAL_SLOTS.find(s => s.key === editSlot)?.label ?? ''}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Proteina (g)</label>
              <input type="number" value={form.proteinG} onChange={e => setForm(p => ({ ...p, proteinG: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Carboidrato (g)</label>
              <input type="number" value={form.carbG} onChange={e => setForm(p => ({ ...p, carbG: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Gordura (g)</label>
              <input type="number" value={form.fatG} onChange={e => setForm(p => ({ ...p, fatG: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Fibra (g)</label>
              <input type="number" value={form.fiberG} onChange={e => setForm(p => ({ ...p, fiberG: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Calorias (kcal)</label>
            <input type="number" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Notas</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" placeholder="O que comeu..." />
          </div>
          <Button className="w-full" onClick={saveMealDetail}>Salvar</Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
