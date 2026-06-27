export interface WeekSession {
  date: string;
  modality: string;
  muscle_groups: string[];
  focus: string;
}

export interface Exercise {
  id: number;
  name: string;
  modality: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  movement_type: string;
  equipment?: string[];
  tags?: string[];
  execution_tips?: string;
}

// Muscle groups that CrossFit already covers heavily
const CROSSFIT_COVERED_GROUPS = ['hamstrings', 'glutes', 'shoulders', 'forearms', 'quadriceps', 'calves'];

// Paulo's specific rules
export const PAULO_RULES = {
  // CrossFit already covers these — weightlifting should avoid overlap
  crossfitCoveredGroups: CROSSFIT_COVERED_GROUPS,
  // Dumbbell bench press is the primary chest compound
  primaryChestCompound: 'dumbbell_bench_press',
  // No barbell curl (elbow discomfort)
  bannedExercises: ['barbell_curl'],
  // Intensity techniques only on isolators
  intensityOnlyOnIsolators: true,
  // Failure only on isolators
  failureOnlyOnIsolators: true,
  // Same day weights + CrossFit → weights first
  weightsBeforeCrossfit: true,
  // Shoulder maintenance only (face pull always present)
  shoulderMaintenance: true,
  alwaysInclude: ['face_pull'],
  // Min hours between training same muscle group
  minRecoveryHours: 48,
};

export function getMuscleGroupsTrainedRecently(
  weekHistory: WeekSession[],
  currentDate: string,
  minHours: number = 48
): string[] {
  const current = new Date(currentDate).getTime();
  const cutoff = current - minHours * 60 * 60 * 1000;

  return weekHistory
    .filter(s => new Date(s.date).getTime() > cutoff)
    .flatMap(s => s.muscle_groups);
}

export function getAvailableMuscleGroups(
  allGroups: string[],
  recentlyTrained: string[],
  modality: string,
  hasCrossfitThisWeek: boolean
): string[] {
  let available = allGroups.filter(g => !recentlyTrained.includes(g));

  // If doing weightlifting and CrossFit is in the week, avoid overlap
  if (modality === 'weightlifting' && hasCrossfitThisWeek) {
    available = available.filter(g => !CROSSFIT_COVERED_GROUPS.includes(g));
  }

  return available;
}

export function shouldExcludeExercise(
  exercise: Exercise,
  profileName: string
): boolean {
  if (profileName.toLowerCase() === 'paulo') {
    if (PAULO_RULES.bannedExercises.some(banned =>
      exercise.name.toLowerCase().includes(banned.replace(/_/g, ' '))
    )) return true;
  }
  return false;
}

export function canApplyIntensityTechnique(exercise: Exercise): boolean {
  return exercise.movement_type === 'isolation';
}

export function canGoToFailure(exercise: Exercise): boolean {
  return exercise.movement_type === 'isolation';
}

export function isOverlapWithCrossfit(muscleGroups: string[]): boolean {
  return muscleGroups.some(g => CROSSFIT_COVERED_GROUPS.includes(g));
}

export function getBlockSetsReps(
  blockType: string,
  focus: string,
  movementType: string
): { sets: number; reps: string; restSeconds: number; rpe: number } {
  if (blockType === 'warmup') {
    return { sets: 2, reps: '10-15', restSeconds: 60, rpe: 5 };
  }

  if (blockType === 'main') {
    if (focus === 'strength') {
      return { sets: 4, reps: '4-6', restSeconds: 180, rpe: 8 };
    }
    if (focus === 'hypertrophy') {
      return { sets: 3, reps: '8-12', restSeconds: 90, rpe: 8 };
    }
    return { sets: 3, reps: '8-12', restSeconds: 90, rpe: 7 };
  }

  if (blockType === 'accessory') {
    if (movementType === 'isolation') {
      return { sets: 3, reps: '10-15', restSeconds: 60, rpe: 9 };
    }
    return { sets: 3, reps: '8-12', restSeconds: 75, rpe: 8 };
  }

  // finisher
  return { sets: 2, reps: '15-20', restSeconds: 45, rpe: 9 };
}
