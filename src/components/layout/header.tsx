'use client';

import { Avatar } from '@/components/ui/avatar';
import { useProfileStore } from '@/stores/profile-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Header() {
  const { activeProfile } = useProfileStore();

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">{getGreeting()}</p>
          <h1 className="text-xl font-bold">{activeProfile?.name ?? 'Fitness'}</h1>
        </div>
        {activeProfile && (
          <Avatar name={activeProfile.name} size="md" />
        )}
      </div>
    </header>
  );
}
