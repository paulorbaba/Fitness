'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { useProfileStore } from '@/stores/profile-store';

interface ProfileData {
  id: string;
  name: string;
  avatar_url?: string;
  age: number;
  weight_kg: number;
  height_m: number;
  goal: string;
  training_intensity: string;
  protein_target_g: number;
  carb_target_g: number;
  carb_target_low_g?: number;
  fat_target_g: number;
}

export default function SelecionarPage() {
  const router = useRouter();
  const { setActiveProfile, setProfiles, activeProfile } = useProfileStore();
  const [profiles, setLocalProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProfile) {
      router.replace('/hoje');
      return;
    }
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setLocalProfiles(data.data ?? []);
        setProfiles(data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (profile: ProfileData) => {
    setActiveProfile(profile);
    router.push('/hoje');
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg-secondary)]">
        <div className="animate-pulse text-[var(--color-text-tertiary)]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-bg-secondary)] px-8">
      <h1 className="text-2xl font-bold mb-2">Fitness</h1>
      <p className="text-[var(--color-text-secondary)] mb-10">Quem está treinando hoje?</p>
      <div className="flex gap-8">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelect(profile)}
            className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
          >
            <Avatar name={profile.name} size="xl" />
            <span className="text-base font-medium">{profile.name}</span>
          </button>
        ))}
      </div>
      {profiles.length === 0 && (
        <p className="text-[var(--color-text-tertiary)] mt-4">
          Nenhum perfil cadastrado.
        </p>
      )}
    </div>
  );
}
