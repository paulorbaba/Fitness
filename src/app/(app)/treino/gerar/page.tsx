'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfileStore } from '@/stores/profile-store';

const MODALITIES = [
  { value: 'weightlifting', label: 'Musculação', icon: '🏋️' },
  { value: 'crossfit', label: 'CrossFit', icon: '💪' },
  { value: 'hyrox', label: 'Hyrox', icon: '🏃' },
  { value: 'swimming', label: 'Natação', icon: '🏊' },
];

const FOCUSES = [
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'strength', label: 'Força' },
  { value: 'conditioning', label: 'Condicionamento' },
  { value: 'recovery', label: 'Recuperação' },
  { value: 'skill', label: 'Técnica' },
];

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Peito' },
  { value: 'back', label: 'Costas' },
  { value: 'shoulders', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'quadriceps', label: 'Quadríceps' },
  { value: 'hamstrings', label: 'Posteriores' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'calves', label: 'Panturrilhas' },
  { value: 'core', label: 'Core' },
  { value: 'forearms', label: 'Antebraços' },
  { value: 'traps', label: 'Trapézio' },
  { value: 'lats', label: 'Dorsal' },
];

export default function GerarTreinoPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [modality, setModality] = useState('weightlifting');
  const [focus, setFocus] = useState('hypertrophy');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  if (!activeProfile) { router.replace('/selecionar'); return null; }

  function toggleMuscle(g: string) {
    setMuscleGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  async function handleGenerate() {
    if (muscleGroups.length === 0) return;
    setGenerating(true);

    const res = await fetch('/api/training/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: activeProfile!.id,
        modality,
        focus,
        targetMuscleGroups: muscleGroups,
      }),
    });

    const json = await res.json();
    setGenerating(false);

    if (json.data?.session?.id) {
      router.push(`/treino/${json.data.session.id}`);
    }
  }

  const showMuscleGroups = modality === 'weightlifting';

  return (
    <PageContainer>
      <h1 className="text-xl font-bold mb-6">Gerar treino</h1>

      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Modalidade</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MODALITIES.map(m => (
          <Card
            key={m.value}
            onClick={() => { setModality(m.value); setMuscleGroups([]); }}
            className={modality === m.value ? 'ring-2 ring-[var(--color-action)]' : ''}
          >
            <div className="text-center">
              <span className="text-2xl">{m.icon}</span>
              <p className="text-sm font-medium mt-1">{m.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Foco</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {FOCUSES.map(f => (
          <button
            key={f.value}
            onClick={() => setFocus(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              focus === f.value
                ? 'bg-[var(--color-action)] text-white'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showMuscleGroups && (
        <>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
            Grupos musculares
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {MUSCLE_GROUPS.map(g => (
              <button
                key={g.value}
                onClick={() => toggleMuscle(g.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  muscleGroups.includes(g.value)
                    ? 'bg-[var(--color-action)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </>
      )}

      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={generating || (showMuscleGroups && muscleGroups.length === 0)}
      >
        {generating ? 'Gerando...' : 'Gerar treino'}
      </Button>
    </PageContainer>
  );
}
