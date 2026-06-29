'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { QuantityPicker } from './quantity-picker';

const CATEGORY_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'protein', label: 'Proteínas' },
  { value: 'vegetable', label: 'Vegetais' },
  { value: 'carb', label: 'Carbos' },
  { value: 'fat', label: 'Gorduras' },
  { value: 'fruit', label: 'Frutas' },
  { value: 'dairy_alt', label: 'Laticínios' },
  { value: 'prepared', label: 'Preparados' },
  { value: 'snack', label: 'Snacks' },
  { value: 'supplement', label: 'Suplementos' },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  post_workout: 'Pós-treino',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

interface Ingredient {
  id: number;
  namePt: string;
  category: string;
  proteinPer100g: string;
  carbPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
  caloriesPer100g: string;
  unit: string;
  defaultPortionG: number | null;
  defaultPortionLabel: string | null;
}

interface AddedItem {
  ingredientId: number;
  name: string;
  quantity: number;
  unit: string;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
  calories: number;
}

interface FoodSearchSheetProps {
  open: boolean;
  onClose: () => void;
  mealSlot: string;
  profileId: string;
  date: string;
  onSaved: () => void;
}

export function FoodSearchSheet({ open, onClose, mealSlot, profileId, date, onSaved }: FoodSearchSheetProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', protein: '', carb: '', fat: '', calories: '', portionG: '100', portionLabel: '100g' });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      fetchIngredients('', '');
      setAddedItems([]);
      setSelectedIngredient(null);
      setSearch('');
      setCategory('');
      setShowCustom(false);
    }
  }, [open]);

  const fetchIngredients = useCallback(async (searchTerm: string, cat: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (cat) params.set('category', cat);
    if (profileId) params.set('profileId', profileId);

    const res = await fetch(`/api/ingredients?${params}`);
    const json = await res.json();
    setResults(json.data ?? []);
    setLoading(false);
  }, [profileId]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchIngredients(value, category), 200);
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    fetchIngredients(search, cat);
  }

  function handleAddItem(item: AddedItem) {
    setAddedItems(prev => [...prev, item]);
    setSelectedIngredient(null);
  }

  function handleRemoveItem(index: number) {
    setAddedItems(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (addedItems.length === 0) return;
    setSaving(true);

    for (const item of addedItems) {
      await fetch('/api/tracker/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          date,
          mealSlot,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
          proteinG: item.proteinG,
          carbG: item.carbG,
          fatG: item.fatG,
          fiberG: item.fiberG,
          calories: item.calories,
        }),
      });
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  async function handleCreateCustom() {
    const protein = parseFloat(customForm.protein) || 0;
    const carb = parseFloat(customForm.carb) || 0;
    const fat = parseFloat(customForm.fat) || 0;
    const cal = parseFloat(customForm.calories) || (protein * 4 + carb * 4 + fat * 9);

    const res = await fetch('/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        namePt: customForm.name,
        proteinPer100g: protein,
        carbPer100g: carb,
        fatPer100g: fat,
        caloriesPer100g: cal,
        defaultPortionG: parseInt(customForm.portionG) || 100,
        defaultPortionLabel: customForm.portionLabel || '100g',
      }),
    });

    const json = await res.json();
    if (json.data) {
      setShowCustom(false);
      setCustomForm({ name: '', protein: '', carb: '', fat: '', calories: '', portionG: '100', portionLabel: '100g' });
      fetchIngredients(customForm.name, '');
    }
  }

  const totals = addedItems.reduce(
    (acc, item) => ({
      protein: acc.protein + item.proteinG,
      carb: acc.carb + item.carbG,
      fat: acc.fat + item.fatG,
      calories: acc.calories + item.calories,
    }),
    { protein: 0, carb: 0, fat: 0, calories: 0 },
  );

  if (selectedIngredient) {
    return (
      <Modal open={open} onClose={onClose} title={MEAL_LABELS[mealSlot] ?? mealSlot}>
        <QuantityPicker
          ingredient={selectedIngredient}
          onAdd={handleAddItem}
          onCancel={() => setSelectedIngredient(null)}
        />
      </Modal>
    );
  }

  if (showCustom) {
    return (
      <Modal open={open} onClose={onClose} title="Criar alimento">
        <div className="space-y-3 p-4">
          <div>
            <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Nome</label>
            <input
              type="text"
              value={customForm.name}
              onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              placeholder="Pasta de amendoim caseira"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Proteína /100g</label>
              <input
                type="number"
                value={customForm.protein}
                onChange={e => setCustomForm(p => ({ ...p, protein: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Carb /100g</label>
              <input
                type="number"
                value={customForm.carb}
                onChange={e => setCustomForm(p => ({ ...p, carb: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Gordura /100g</label>
              <input
                type="number"
                value={customForm.fat}
                onChange={e => setCustomForm(p => ({ ...p, fat: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Calorias /100g</label>
              <input
                type="number"
                value={customForm.calories}
                onChange={e => setCustomForm(p => ({ ...p, calories: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                placeholder="Auto-calculado"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Porção (g)</label>
              <input
                type="number"
                value={customForm.portionG}
                onChange={e => setCustomForm(p => ({ ...p, portionG: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-secondary)] mb-1 block">Label porção</label>
              <input
                type="text"
                value={customForm.portionLabel}
                onChange={e => setCustomForm(p => ({ ...p, portionLabel: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                placeholder="1 colher"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCustom(false)}>Voltar</Button>
            <Button className="flex-1" onClick={handleCreateCustom} disabled={!customForm.name}>Criar</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={MEAL_LABELS[mealSlot] ?? mealSlot}>
      <div className="flex flex-col" style={{ maxHeight: '70dvh' }}>
        <div className="px-4 pt-2 pb-3 space-y-3 flex-shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Buscar alimento..."
              className="w-full h-11 pl-9 pr-8 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); fetchIngredients('', category); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {CATEGORY_CHIPS.map(c => (
              <button
                key={c.value}
                onClick={() => handleCategoryChange(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === c.value
                    ? 'bg-[var(--color-action)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-text-secondary)] py-8">
              Nenhum alimento encontrado
            </p>
          ) : (
            <div className="space-y-1">
              {results.map(ing => (
                <button
                  key={ing.id}
                  onClick={() => setSelectedIngredient(ing)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)] active:scale-[0.98] transition-all"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{ing.namePt}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {ing.defaultPortionLabel || `100${ing.unit === 'ml' ? 'mL' : 'g'}`}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span style={{ color: 'var(--color-protein)' }}>{Number(ing.proteinPer100g).toFixed(0)}P</span>
                    <span style={{ color: 'var(--color-carbs)' }}>{Number(ing.carbPer100g).toFixed(0)}C</span>
                    <span style={{ color: 'var(--color-fat)' }}>{Number(ing.fatPer100g).toFixed(0)}G</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCustom(true)}
            className="w-full mt-3 mb-3 p-3 rounded-xl border-2 border-dashed border-[var(--color-separator)] text-sm font-medium text-[var(--color-action)] active:scale-[0.98] transition-all"
          >
            + Criar alimento customizado
          </button>
        </div>

        {addedItems.length > 0 && (
          <div className="border-t border-[var(--color-separator)] px-4 py-3 flex-shrink-0 bg-[var(--color-bg-primary)]">
            <div className="space-y-1 mb-3 max-h-[120px] overflow-y-auto">
              {addedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate flex-1">{item.name} x{item.quantity}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {item.proteinG.toFixed(0)}P {item.carbG.toFixed(0)}C {item.fatG.toFixed(0)}G
                    </span>
                    <button
                      onClick={() => handleRemoveItem(i)}
                      className="text-[var(--color-error)] text-xs font-medium ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-3">
              <span>Total:</span>
              <span>
                <span style={{ color: 'var(--color-protein)' }}>{totals.protein.toFixed(0)}P</span>
                {' | '}
                <span style={{ color: 'var(--color-carbs)' }}>{totals.carb.toFixed(0)}C</span>
                {' | '}
                <span style={{ color: 'var(--color-fat)' }}>{totals.fat.toFixed(0)}G</span>
                {' | '}
                <span>{totals.calories} kcal</span>
              </span>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : `Salvar refeição (${addedItems.length} itens)`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
