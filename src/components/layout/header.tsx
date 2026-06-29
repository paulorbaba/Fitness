'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { useProfileStore } from '@/stores/profile-store';

const MAIN_ROUTES = ['/hoje', '/cardapio', '/treino', '/compras', '/perfil'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeProfile } = useProfileStore();

  const isMainRoute = MAIN_ROUTES.includes(pathname);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {!isMainRoute && (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">{getGreeting()}</p>
            <h1 className="text-xl font-bold">{activeProfile?.name ?? 'Fitness'}</h1>
          </div>
        </div>
        {activeProfile && (
          <Avatar name={activeProfile.name} size="md" />
        )}
      </div>
    </header>
  );
}
