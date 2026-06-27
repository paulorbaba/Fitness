import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
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

interface ProfileStore {
  activeProfile: Profile | null;
  profiles: Profile[];
  setActiveProfile: (profile: Profile) => void;
  setProfiles: (profiles: Profile[]) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      activeProfile: null,
      profiles: [],
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      setProfiles: (profiles) => set({ profiles }),
      clearProfile: () => set({ activeProfile: null }),
    }),
    { name: 'fitness-profile' }
  )
);
