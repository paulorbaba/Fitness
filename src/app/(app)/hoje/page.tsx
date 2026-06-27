'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';

const SLOT_LABELS: Record<string, string> = {
  post_workout: 'Pós-treino',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

const MODALITY_LABELS: Record<string, string> = {
  crossfit: 'CrossFit',
  hyrox: 'Hyrox',
  swimming: 'Natação',
  weightlifting: 'Musculação',
};

interface MealData {
  id: number;
  mealSlot: string;
  portionMultiplier: string;
  proteinG: string;
  carbG: string;
  fatG: string;
  calories: string;
  dish: { name: string };
}

interface SessionData {
  id: number;
  modality: string;
  focus: string;
  muscleGroups: string[];
  status: string;
}

export default function HojePage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }

    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      fetch(`/api/meals?date=${today}&profileId=${activeProfile.id}`).then(r => r.json()),
      fetch(`/api/training/sessions?date=${today}&profileId=${activeProfile.id}`).then(r => r.json()),
    ]).then(([mealsRes, sessionsRes]) => {
      setMeals(mealsRes.data ?? []);
      setSessions(sessionsRes.data ?? []);
    }).finally(() => setLoading(false));
  }, [activeProfile]);

  if (!activeProfile) return null;

  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + Number(m.proteinG || 0),
      carbs: acc.carbs + Number(m.carbG || 0),
      fat: acc.fat + Number(m.fatG || 0),
      calories: acc.calories + Number(m.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );

  const targetCalories = activeProfile.protein_target_g * 4 + activeProfile.carb_target_g * 4 + (activeProfile.fat_target_g ?? 80) * 9;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-around mb-6 mt-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-[72px] h-[72px] rounded-full" />)}
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 mb-3" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-around mb-6 mt-2">
        <ProgressRing value={totals.protein} max={activeProfile.protein_target_g} color="#FF6B6B" label="Proteína" />
        <ProgressRing value={totals.carbs} max={activeProfile.carb_target_g} color="#FFB84D" label="Carbos" />
        <ProgressRing value={totals.fat} max={activeProfile.fat_target_g ?? 80} color="#4ECDC4" label="Gordura" />
        <ProgressRing value={totals.calories} max={targetCalories} color="#95E1D3" label="Calorias" unit="kcal" />
      </div>

      <h2 className="text-lg font-semibold mb-3">Meu prato hoje</h2>
      {meals.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-[var(--color-text-secondary)] mb-3">Nenhum ciclo ativo</p>
          <button
            onClick={() => router.push('/cardapio')}
            className="text-[var(--color-action)] font-medium"
          >
            Criar cardápio
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {['post_workout', 'lunch', 'snack', 'dinner'].map(slot => {
            const meal = meals.find(m => m.mealSlot === slot);
            if (!meal) return null;
            return (
              <Card key={slot}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{SLOT_LABELS[slot]}</p>
                    <p className="font-medium">{meal.dish.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      P: {Math.round(Number(meal.proteinG))}g &middot; C: {Math.round(Number(meal.carbG))}g &middot; G: {Math.round(Number(meal.fatG))}g
                    </p>
                  </div>
                  <Badge color="#007AFF">
                    {Math.round(Number(meal.portionMultiplier) * 100)}%
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3 mt-6">Treino de hoje</h2>
      {sessions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-[var(--color-text-secondary)] mb-3">Nenhum treino para hoje</p>
          <button
            onClick={() => router.push('/treino/gerar')}
            className="text-[var(--color-action)] font-medium"
          >
            Gerar treino
          </button>
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
                  {s.status === 'completed' ? 'Concluído' : s.status === 'in_progress' ? 'Em andamento' : 'Planejado'}
                </Badge>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {s.muscleGroups.map(g => (
                  <Badge key={g} color="#787880">{g}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
