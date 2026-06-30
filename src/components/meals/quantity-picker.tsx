'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Ingredient {
  id: number;
  namePt: string;
  proteinPer100g: string;
  carbPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
  caloriesPer100g: string;
  unit: string;
  defaultPortionG: number | null;
  defaultPortionLabel: string | null;
}

interface QuantityPickerProps {
  ingredient: Ingredient;
  onAdd: (item: {
    ingredientId: number;
    name: string;
    quantity: number;
    unit: string;
    proteinG: number;
    carbG: number;
    fatG: number;
    fiberG: number;
    calories: number;
  }) => void;
  onCancel: () => void;
  editMode?: { quantity: number; itemId: number };
  onUpdate?: (item: {
    itemId: number;
    quantity: number;
    unit: string;
    proteinG: number;
    carbG: number;
    fatG: number;
    fiberG: number;
    calories: number;
  }) => void;
}

export function QuantityPicker({ ingredient, onAdd, onCancel, editMode, onUpdate }: QuantityPickerProps) {
  const isUnit = ingredient.unit === 'un';
  const isMl = ingredient.unit === 'ml' || ingredient.unit === 'mL';
  const portionG = ingredient.defaultPortionG || 100;

  const [count, setCount] = useState(editMode ? editMode.quantity : (isUnit ? 1 : portionG));
  const step = isUnit ? 1 : isMl ? 50 : 10;

  const gramsEquiv = isUnit ? count * portionG : count;
  const factor = gramsEquiv / 100;

  const protein = Number(ingredient.proteinPer100g) * factor;
  const carb = Number(ingredient.carbPer100g) * factor;
  const fat = Number(ingredient.fatPer100g) * factor;
  const fiber = Number(ingredient.fiberPer100g || 0) * factor;
  const cal = Number(ingredient.caloriesPer100g) * factor;

  function handleAdd() {
    if (editMode && onUpdate) {
      onUpdate({
        itemId: editMode.itemId,
        quantity: count,
        unit: ingredient.unit || 'g',
        proteinG: Math.round(protein * 10) / 10,
        carbG: Math.round(carb * 10) / 10,
        fatG: Math.round(fat * 10) / 10,
        fiberG: Math.round(fiber * 10) / 10,
        calories: Math.round(cal),
      });
    } else {
      onAdd({
        ingredientId: ingredient.id,
        name: ingredient.namePt,
        quantity: count,
        unit: ingredient.unit || 'g',
        proteinG: Math.round(protein * 10) / 10,
        carbG: Math.round(carb * 10) / 10,
        fatG: Math.round(fat * 10) / 10,
        fiberG: Math.round(fiber * 10) / 10,
        calories: Math.round(cal),
      });
    }
  }

  const displayQuantity = isUnit
    ? `${count} un (${gramsEquiv}g)`
    : isMl
      ? count >= 1000 ? `${(count / 1000).toFixed(1)}L` : `${count}mL`
      : count >= 1000 ? `${(count / 1000).toFixed(1)}kg` : `${count}g`;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-base">{ingredient.namePt}</h3>
        <button onClick={onCancel} className="text-[var(--color-text-tertiary)] text-sm">Voltar</button>
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] mb-4">
        P: {Number(ingredient.proteinPer100g).toFixed(1)}g
        {' · '}C: {Number(ingredient.carbPer100g).toFixed(1)}g
        {' · '}G: {Number(ingredient.fatPer100g).toFixed(1)}g
        {' · '}{Math.round(Number(ingredient.caloriesPer100g))} kcal
        <span className="text-[var(--color-text-tertiary)]"> /100{isMl ? 'mL' : 'g'}</span>
      </p>

      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setCount(Math.max(step, count - step))}
          className="w-11 h-11 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--color-text-primary)] active:scale-95 transition-transform"
        >
          -
        </button>
        <div className="min-w-[120px] text-center">
          <p className="text-xl font-bold">{displayQuantity}</p>
          {isUnit && ingredient.defaultPortionLabel && (
            <p className="text-xs text-[var(--color-text-tertiary)]">{ingredient.defaultPortionLabel}</p>
          )}
        </div>
        <button
          onClick={() => setCount(count + step)}
          className="w-11 h-11 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--color-text-primary)] active:scale-95 transition-transform"
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 rounded-xl bg-[var(--color-bg-secondary)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">Prot</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-protein)' }}>{protein.toFixed(1)}g</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-[var(--color-bg-secondary)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">Carb</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-carbs)' }}>{carb.toFixed(1)}g</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-[var(--color-bg-secondary)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">Gord</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-fat)' }}>{fat.toFixed(1)}g</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-[var(--color-bg-secondary)]">
          <p className="text-xs text-[var(--color-text-tertiary)]">Kcal</p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-calories)' }}>{Math.round(cal)}</p>
        </div>
      </div>

      <Button className="w-full" onClick={handleAdd}>{editMode ? 'Salvar' : 'Adicionar'}</Button>
    </div>
  );
}
