'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { useProfileStore } from '@/stores/profile-store';

const MODALITY_LABELS: Record<string, string> = {
  crossfit: 'CrossFit',
  hyrox: 'Hyrox',
  swimming: 'Natação',
  weightlifting: 'Musculação',
};

interface ProfileDetail {
  id: string;
  name: string;
  age: number;
  weightKg: number;
  heightM: number;
  goal: string;
  trainingIntensity: string;
  trainsFasted: boolean;
  trainingTime: string;
  proteinTargetG: number;
  carbTargetG: number;
  carbTargetLowG: number | null;
  fatTargetG: number;
  restrictions: Array<{ id: number; item: string; restrictionType: string; category: string | null }>;
  preferences: Array<{ id: number; modality: string; daysPerWeek: number | null; priority: number }>;
}

export default function PerfilPage() {
  const router = useRouter();
  const { activeProfile, setActiveProfile, clearProfile } = useProfileStore();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({
    weightKg: '',
    proteinTargetG: '',
    carbTargetG: '',
    carbTargetLowG: '',
    fatTargetG: '',
  });

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetch(`/api/profiles/${activeProfile.id}`)
      .then(r => r.json())
      .then(res => {
        setProfile(res.data ?? null);
        if (res.data) {
          setFormData({
            weightKg: String(res.data.weightKg),
            proteinTargetG: String(res.data.proteinTargetG),
            carbTargetG: String(res.data.carbTargetG),
            carbTargetLowG: String(res.data.carbTargetLowG ?? ''),
            fatTargetG: String(res.data.fatTargetG),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [activeProfile]);

  async function handleSave() {
    if (!activeProfile) return;
    const weight = parseFloat(formData.weightKg);
    const protein = parseInt(formData.proteinTargetG);
    const carb = parseInt(formData.carbTargetG);
    const carbLow = formData.carbTargetLowG ? parseInt(formData.carbTargetLowG) : null;
    const fat = parseInt(formData.fatTargetG);

    await fetch(`/api/profiles/${activeProfile.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weight_kg: weight,
        protein_target_g: protein,
        carb_target_g: carb,
        carb_target_low_g: carbLow,
        fat_target_g: fat,
      }),
    });
    setEditModal(false);
    const res = await fetch(`/api/profiles/${activeProfile.id}`);
    const json = await res.json();
    setProfile(json.data ?? null);
    if (json.data) {
      setActiveProfile({
        ...activeProfile,
        weight_kg: weight,
        protein_target_g: protein,
        carb_target_g: carb,
        carb_target_low_g: carbLow ?? undefined,
        fat_target_g: fat,
      });
    }
  }

  function handleLogout() {
    clearProfile();
    router.replace('/selecionar');
  }

  if (!activeProfile) return null;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-20 h-20 rounded-full mb-3" />
          <Skeleton className="h-6 w-32" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 mb-3" />)}
      </PageContainer>
    );
  }

  if (!profile) return null;

  const fatTarget = profile.fatTargetG ?? 80;
  const totalCalories = profile.proteinTargetG * 4 + profile.carbTargetG * 4 + fatTarget * 9;

  return (
    <PageContainer>
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[var(--color-action)] flex items-center justify-center text-3xl text-white font-bold mb-3">
          {profile.name[0]}
        </div>
        <h1 className="text-xl font-bold">{profile.name}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {profile.age} anos &middot; {profile.weightKg}kg &middot; {profile.heightM}m
        </p>
      </div>

      <Card className="mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Metas de macros</h2>
          <button onClick={() => setEditModal(true)} className="text-sm text-[var(--color-action)] font-medium">Editar</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
            <p className="text-xs text-[var(--color-text-tertiary)]">Proteína</p>
            <p className="text-lg font-bold" style={{ color: '#FF6B6B' }}>{profile.proteinTargetG}g</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
            <p className="text-xs text-[var(--color-text-tertiary)]">Carboidrato</p>
            <p className="text-lg font-bold" style={{ color: '#FFB84D' }}>{profile.carbTargetG}g</p>
            {profile.carbTargetLowG && (
              <p className="text-xs text-[var(--color-text-secondary)]">Low: {profile.carbTargetLowG}g</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
            <p className="text-xs text-[var(--color-text-tertiary)]">Gordura</p>
            <p className="text-lg font-bold" style={{ color: '#4ECDC4' }}>{fatTarget}g</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
            <p className="text-xs text-[var(--color-text-tertiary)]">Calorias</p>
            <p className="text-lg font-bold" style={{ color: '#95E1D3' }}>{totalCalories} kcal</p>
          </div>
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="font-semibold mb-3">Treino</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Objetivo</span>
            <span className="text-sm font-medium capitalize">{profile.goal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Intensidade</span>
            <span className="text-sm font-medium capitalize">{profile.trainingIntensity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Treina em jejum</span>
            <span className="text-sm font-medium">{profile.trainsFasted ? 'Sim' : 'Não'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Horário</span>
            <span className="text-sm font-medium">{profile.trainingTime}</span>
          </div>
        </div>
        {profile.preferences.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {profile.preferences
              .sort((a, b) => a.priority - b.priority)
              .map(p => (
                <Badge key={p.id} color="#007AFF">
                  {MODALITY_LABELS[p.modality] ?? p.modality}
                  {p.daysPerWeek ? ` ${p.daysPerWeek}x` : ''}
                </Badge>
              ))}
          </div>
        )}
      </Card>

      {profile.restrictions.length > 0 && (
        <Card className="mb-3">
          <h2 className="font-semibold mb-3">Restrições alimentares</h2>
          <div className="flex flex-wrap gap-2">
            {profile.restrictions.map(r => (
              <Badge key={r.id} color={r.restrictionType === 'prohibited' ? '#FF3B30' : '#34C759'}>
                {r.item}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Button variant="ghost" className="w-full mt-4" onClick={handleLogout}>Trocar perfil</Button>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar metas">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weightKg}
              onChange={e => setFormData(prev => ({ ...prev, weightKg: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Proteína (g/dia)</label>
            <input
              type="number"
              value={formData.proteinTargetG}
              onChange={e => setFormData(prev => ({ ...prev, proteinTargetG: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Carboidrato (g/dia)</label>
            <input
              type="number"
              value={formData.carbTargetG}
              onChange={e => setFormData(prev => ({ ...prev, carbTargetG: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Carb low (g/dia, opcional)</label>
            <input
              type="number"
              value={formData.carbTargetLowG}
              onChange={e => setFormData(prev => ({ ...prev, carbTargetLowG: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              placeholder="Dias sem CrossFit/Hyrox"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Gordura (g/dia)</label>
            <input
              type="number"
              value={formData.fatTargetG}
              onChange={e => setFormData(prev => ({ ...prev, fatTargetG: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
            />
          </div>
          <Button className="w-full" onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
