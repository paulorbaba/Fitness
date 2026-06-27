export interface ExerciseHistory {
  date: string;
  sets: number;
  reps: number;
  weight_kg: number;
  rpe: number;
}

export interface ProgressionSuggestion {
  weight_kg: number;
  reps: string;
  sets: number;
  rest_seconds?: number;
  notes?: string;
}

export function suggestProgression(
  movementType: string,
  history: ExerciseHistory[],
  focus: string
): ProgressionSuggestion {
  if (history.length === 0) {
    return {
      weight_kg: 0,
      reps: focus === 'strength' ? '5' : '10',
      sets: 3,
      notes: 'Primeira sessão — encontre um peso confortável para aquecer e progrida',
    };
  }

  const last = history[history.length - 1];
  const weightIncrement = movementType === 'compound' ? 2.5 : 1.25;

  // If RPE was low (<8), increase weight
  if (last.rpe < 8) {
    return {
      weight_kg: last.weight_kg + weightIncrement,
      reps: `${last.reps}`,
      sets: last.sets,
      notes: 'Progredindo em carga — RPE anterior estava controlado',
    };
  }

  // If RPE was moderate (8-8.5), increase reps
  if (last.rpe <= 8.5) {
    const newReps = last.reps + 1;
    const repCap = focus === 'strength' ? 6 : 15;

    if (newReps > repCap) {
      return {
        weight_kg: last.weight_kg + weightIncrement,
        reps: focus === 'strength' ? '4' : '8',
        sets: last.sets,
        notes: 'Atingiu o teto de reps — aumentando carga e reiniciando faixa de reps',
      };
    }

    return {
      weight_kg: last.weight_kg,
      reps: `${newReps}`,
      sets: last.sets,
      notes: 'Progredindo em repetições',
    };
  }

  // If RPE was high (>8.5), maintain or reduce slightly
  if (last.rpe >= 9.5) {
    return {
      weight_kg: last.weight_kg,
      reps: `${last.reps}`,
      sets: last.sets,
      rest_seconds: 15,
      notes: 'RPE muito alto na última sessão — mantendo carga, adicionando descanso',
    };
  }

  // RPE 8.5-9.5: maintain current load
  return {
    weight_kg: last.weight_kg,
    reps: `${last.reps}`,
    sets: last.sets,
    notes: 'Mantendo carga atual — boa intensidade',
  };
}
