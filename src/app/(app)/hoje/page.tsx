'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';
import { FoodSearchSheet } from '@/components/meals/food-search-sheet';

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Café da manhã', icon: '☀️' },
  { key: 'post_workout', label: 'Pós-treino', icon: '💪' },
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
}

interface FoodItem {
  id: number;
  meal_slot: string;
  ingredient_name: string | null;
  custom_name: string | null;
  quantity: string;
  unit: string;
  protein_g: string;
  carb_g: string;
  fat_g: string;
  calories: string;
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
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [hydration, setHydration] = useState<HydrationData>({ glasses: 0, target_glasses: 8 });
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    const [trackerRes, foodsRes, sessionsRes] = await Promise.all([
      fetch(`/api/tracker?profileId=${activeProfile.id}&date=${today}`).then(r => r.json()),
      fetch(`/api/tracker/foods?profileId=${activeProfile.id}&date=${today}`).then(r => r.json()),
      fetch(`/api/training/sessions?date=${today}&profileId=${activeProfile.id}`).then(r => r.json()),
    ]);
    setMeals(trackerRes.data?.meals ?? []);
    setHydration(trackerRes.data?.hydration ?? { glasses: 0, target_glasses: 8 });
    setFoodItems(foodsRes.data ?? []);
    setSessions(sessionsRes.data ?? []);
    setLoading(false);
  }, [activeProfile, today]);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetchData();
  }, [activeProfile, fetchData]);

  async function deleteFood(itemId: number) {
    setDeletingId(itemId);
    await fetch(`/api/tracker/foods/${itemId}`, { method: 'DELETE' });
    await fetchData();
    setDeletingId(null);
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
    { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 },
  );

  const fatTarget = activeProfile.fat_target_g ?? 80;
  const targetCalories = activeProfile.protein_target_g * 4 + activeProfile.carb_target_g * 4 + fatTarget * 9;

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
      <div className="flex justify-around mb-4 mt-2">
        <ProgressRing value={totals.protein} max={activeProfile.protein_target_g} color="var(--color-protein)" label="Proteína" />
        <ProgressRing value={totals.carbs} max={activeProfile.carb_target_g} color="var(--color-carbs)" label="Carbos" />
        <ProgressRing value={totals.fat} max={fatTarget} color="var(--color-fat)" label="Gordura" />
        <ProgressRing value={totals.calories} max={targetCalories} color="var(--color-calories)" label="Calorias" unit="kcal" />
      </div>

      {totals.protein > 0 && (
        <div className="mb-6 space-y-1.5">
          {MEAL_SLOTS.map(slot => {
            const log = meals.find(m => m.meal_slot === slot.key);
            const mealProtein = Number(log?.protein_g || 0);
            const pct = activeProfile.protein_target_g > 0 ? (mealProtein / activeProfile.protein_target_g) * 100 : 0;
            if (mealProtein === 0) return null;
            return (
              <div key={slot.key} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-[var(--color-text-secondary)] truncate">{slot.label.split(' ')[0]}</span>
                <div className="flex-1 h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: 'var(--color-protein)' }}
                  />
                </div>
                <span className="w-10 text-right text-[var(--color-text-tertiary)]">{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Refeições</h2>
      </div>

      <div className="space-y-3 mb-6">
        {MEAL_SLOTS.map(slot => {
          const log = meals.find(m => m.meal_slot === slot.key);
          const slotItems = foodItems.filter(f => f.meal_slot === slot.key);
          const hasMacros = log && (Number(log.protein_g || 0) > 0 || Number(log.carb_g || 0) > 0 || Number(log.fat_g || 0) > 0);
          return (
            <Card key={slot.key} className={hasMacros ? 'ring-1 ring-[var(--color-success)]/30' : ''}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{slot.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{slot.label}</p>
                  {hasMacros ? (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      <span style={{ color: 'var(--color-protein)' }}>{Math.round(Number(log.protein_g || 0))}P</span>
                      {' · '}
                      <span style={{ color: 'var(--color-carbs)' }}>{Math.round(Number(log.carb_g || 0))}C</span>
                      {' · '}
                      <span style={{ color: 'var(--color-fat)' }}>{Math.round(Number(log.fat_g || 0))}G</span>
                      {' · '}
                      <span>{Math.round(Number(log.calories || 0))} kcal</span>
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Toque + para adicionar</p>
                  )}
                </div>
                <button
                  onClick={() => setActiveSlot(slot.key)}
                  className="w-8 h-8 rounded-full bg-[var(--color-action)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>

              {slotItems.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-[var(--color-separator)] pt-2">
                  {slotItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">
                          {item.ingredient_name || item.custom_name}
                          <span className="text-[var(--color-text-tertiary)] text-xs ml-1">
                            {Number(item.quantity)}{item.unit === 'un' ? ' un' : item.unit === 'ml' ? 'mL' : 'g'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {Math.round(Number(item.protein_g))}P {Math.round(Number(item.carb_g))}C {Math.round(Number(item.fat_g))}G
                        </span>
                        <button
                          onClick={() => deleteFood(item.id)}
                          className="text-[var(--color-error)] text-xs font-medium"
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? '...' : '✕'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">Hidratação</h2>
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
            className="h-full bg-[var(--color-action-light)] rounded-full transition-all"
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
                <Badge color={s.status === 'completed' ? 'var(--color-success)' : s.status === 'in_progress' ? 'var(--color-warning)' : 'var(--color-action)'}>
                  {s.status === 'completed' ? 'Concluído' : s.status === 'in_progress' ? 'Em andamento' : 'Planejado'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FoodSearchSheet
        open={!!activeSlot}
        onClose={() => setActiveSlot(null)}
        mealSlot={activeSlot ?? ''}
        profileId={activeProfile.id}
        date={today}
        onSaved={fetchData}
      />
    </PageContainer>
  );
}
