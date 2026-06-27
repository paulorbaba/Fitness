'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileStore } from '@/stores/profile-store';

const SECTION_LABELS: Record<string, string> = {
  produce: 'Hortifruti',
  proteins: 'Carnes e Proteínas',
  dairy: 'Laticínios',
  grains: 'Grãos e Cereais',
  frozen: 'Congelados',
  canned: 'Enlatados e Conservas',
  condiments: 'Condimentos e Temperos',
  oils: 'Óleos e Azeites',
  bakery: 'Padaria',
  nuts: 'Castanhas e Oleaginosas',
  supplements: 'Suplementos',
  beverages: 'Bebidas',
  other: 'Outros',
};

interface ShoppingItem {
  id: number;
  ingredient_name: string;
  total_quantity_g: number;
  store_section: string;
  unit: string;
  checked: boolean;
}

interface CycleRef {
  id: number;
  status: string;
}

export default function ComprasPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [cycle, setCycle] = useState<CycleRef | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProfile) { router.replace('/selecionar'); return; }
    fetchData();
  }, [activeProfile]);

  async function fetchData() {
    setLoading(true);
    const cycleRes = await fetch(`/api/cycles/current?profileId=${activeProfile!.id}`);
    const cycleJson = await cycleRes.json();
    const currentCycle = cycleJson.data;

    if (!currentCycle || currentCycle.status !== 'active') {
      setCycle(null);
      setItems([]);
      setLoading(false);
      return;
    }

    setCycle({ id: currentCycle.id, status: currentCycle.status });
    const shopRes = await fetch(`/api/shopping?cycleId=${currentCycle.id}`);
    const shopJson = await shopRes.json();
    setItems(shopJson.data ?? []);
    setLoading(false);
  }

  async function toggleItem(itemId: number, checked: boolean) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked } : i));
    await fetch('/api/shopping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, checked }),
    });
  }

  function formatQuantity(g: number, unit: string): string {
    if (unit === 'ml' || unit === 'mL') {
      return g >= 1000 ? `${(g / 1000).toFixed(1)}L` : `${Math.round(g)}mL`;
    }
    if (unit === 'un') return `${Math.round(g)} un`;
    return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${Math.round(g)}g`;
  }

  function exportList() {
    const unchecked = items.filter(i => !i.checked);
    const sections = [...new Set(unchecked.map(i => i.store_section))];
    let text = 'Lista de Compras\n\n';
    for (const section of sections) {
      text += `📍 ${SECTION_LABELS[section] ?? section}\n`;
      const sectionItems = unchecked.filter(i => i.store_section === section);
      for (const item of sectionItems) {
        text += `  ○ ${item.ingredient_name} — ${formatQuantity(item.total_quantity_g, item.unit)}\n`;
      }
      text += '\n';
    }
    navigator.clipboard?.writeText(text);
  }

  function exportCookList() {
    let text = 'Lista para Cozinheira\n\n';
    const sections = [...new Set(items.map(i => i.store_section))];
    for (const section of sections) {
      text += `${SECTION_LABELS[section] ?? section}\n`;
      const sectionItems = items.filter(i => i.store_section === section);
      for (const item of sectionItems) {
        text += `  • ${item.ingredient_name}: ${formatQuantity(item.total_quantity_g, item.unit)}\n`;
      }
      text += '\n';
    }
    navigator.clipboard?.writeText(text);
  }

  if (!activeProfile) return null;

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-48 mb-4" />
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-12 mb-2" />)}
      </PageContainer>
    );
  }

  if (!cycle) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-lg font-semibold mb-2">Sem lista de compras</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">Ative um ciclo de cardápio para gerar a lista de compras.</p>
          <Button onClick={() => router.push('/cardapio')}>Ir para cardápio</Button>
        </div>
      </PageContainer>
    );
  }

  const sections = [...new Set(items.map(i => i.store_section))];
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold">Lista de compras</h1>
        <span className="text-sm text-[var(--color-text-secondary)]">{checkedCount}/{items.length}</span>
      </div>

      <div className="h-1.5 bg-[var(--color-bg-secondary)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#34C759] rounded-full transition-all"
          style={{ width: items.length > 0 ? `${(checkedCount / items.length) * 100}%` : '0%' }}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant="secondary" size="sm" onClick={exportList} className="flex-1">Copiar lista</Button>
        <Button variant="secondary" size="sm" onClick={exportCookList} className="flex-1">Lista cozinheira</Button>
      </div>

      {sections.map(section => (
        <div key={section} className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
            {SECTION_LABELS[section] ?? section}
          </h2>
          <div className="space-y-1">
            {items.filter(i => i.store_section === section).map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id, !item.checked)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  item.checked ? 'opacity-50' : ''
                } bg-[var(--color-bg-tertiary)]`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.checked ? 'bg-[#34C759] border-[#34C759]' : 'border-[var(--color-separator)]'
                }`}>
                  {item.checked && <span className="text-white text-xs">✓</span>}
                </span>
                <span className={`flex-1 text-left text-sm ${item.checked ? 'line-through' : 'font-medium'}`}>
                  {item.ingredient_name}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {formatQuantity(item.total_quantity_g, item.unit)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </PageContainer>
  );
}
