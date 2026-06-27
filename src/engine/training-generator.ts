import {
  getMuscleGroupsTrainedRecently,
  getAvailableMuscleGroups,
  shouldExcludeExercise,
  canApplyIntensityTechnique,
  canGoToFailure,
  getBlockSetsReps,
  PAULO_RULES,
  type WeekSession,
  type Exercise,
} from './training-rules';

export interface GenerateTrainingParams {
  profileName: string;
  profileId: string;
  modality: string;
  focus: string;
  targetMuscleGroups: string[];
  date: string;
  weekHistory: WeekSession[];
  availableExercises: Exercise[];
}

export interface GeneratedBlock {
  block_type: 'warmup' | 'main' | 'accessory' | 'finisher';
  exercises: GeneratedExercise[];
}

export interface GeneratedExercise {
  exercise_id: number;
  exercise_name: string;
  block_type: string;
  order_index: number;
  prescribed_sets: number;
  prescribed_reps: string;
  prescribed_rpe: number;
  rest_seconds: number;
  intensity_technique?: string;
  to_failure: boolean;
  notes?: string;
}

const INTENSITY_TECHNIQUES = ['drop_set', 'rest_pause', 'myo_reps', 'mechanical_drop', 'slow_negative'];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectExercises(
  pool: Exercise[],
  targetMuscles: string[],
  movementType: 'compound' | 'isolation' | 'any',
  count: number,
  profileName: string,
): Exercise[] {
  let filtered = pool.filter(e => {
    if (shouldExcludeExercise(e, profileName)) return false;
    const hasTargetMuscle = e.primary_muscles.some(m => targetMuscles.includes(m));
    if (!hasTargetMuscle) return false;
    if (movementType !== 'any' && e.movement_type !== movementType) return false;
    return true;
  });

  // For Paulo's chest, ensure dumbbell bench press is first compound
  if (profileName.toLowerCase() === 'paulo' && targetMuscles.includes('chest') && movementType === 'compound') {
    const dbBench = filtered.find(e => e.name.toLowerCase().includes('dumbbell bench press'));
    if (dbBench) {
      filtered = [dbBench, ...filtered.filter(e => e.id !== dbBench.id)];
    }
  }

  return shuffleArray(filtered).slice(0, count);
}

export function generateTrainingSession(params: GenerateTrainingParams): GeneratedBlock[] {
  const {
    profileName,
    modality,
    focus,
    targetMuscleGroups,
    date,
    weekHistory,
    availableExercises,
  } = params;

  const recentlyTrained = getMuscleGroupsTrainedRecently(weekHistory, date);
  const hasCrossfit = weekHistory.some(s => s.modality === 'crossfit');

  const availableGroups = getAvailableMuscleGroups(
    targetMuscleGroups,
    recentlyTrained,
    modality,
    hasCrossfit
  );

  const exercisePool = availableExercises.filter(e => e.modality === modality || e.modality === 'weightlifting');
  const blocks: GeneratedBlock[] = [];
  let orderIndex = 0;

  // WARMUP BLOCK (2-3 exercises)
  const warmupExercises = selectExercises(exercisePool, availableGroups, 'any', 2, profileName);
  blocks.push({
    block_type: 'warmup',
    exercises: warmupExercises.map(e => {
      const config = getBlockSetsReps('warmup', focus, e.movement_type);
      return {
        exercise_id: e.id,
        exercise_name: e.name,
        block_type: 'warmup',
        order_index: orderIndex++,
        prescribed_sets: config.sets,
        prescribed_reps: config.reps,
        prescribed_rpe: config.rpe,
        rest_seconds: config.restSeconds,
        to_failure: false,
        notes: e.execution_tips ?? undefined,
      };
    }),
  });

  // MAIN BLOCK (3-5 compound exercises)
  const mainCount = focus === 'strength' ? 4 : 3;
  const usedIds = new Set(warmupExercises.map(e => e.id));
  const mainPool = exercisePool.filter(e => !usedIds.has(e.id));
  const mainExercises = selectExercises(mainPool, availableGroups, 'compound', mainCount, profileName);

  // For Paulo: always include face pull if targeting shoulders or back
  if (profileName.toLowerCase() === 'paulo' &&
      (availableGroups.includes('shoulders') || availableGroups.includes('back') || availableGroups.includes('posterior_deltoid'))) {
    const facePull = exercisePool.find(e => e.name.toLowerCase().includes('face pull'));
    if (facePull && !mainExercises.some(e => e.id === facePull.id)) {
      mainExercises.push(facePull);
    }
  }

  blocks.push({
    block_type: 'main',
    exercises: mainExercises.map(e => {
      const config = getBlockSetsReps('main', focus, e.movement_type);
      return {
        exercise_id: e.id,
        exercise_name: e.name,
        block_type: 'main',
        order_index: orderIndex++,
        prescribed_sets: config.sets,
        prescribed_reps: config.reps,
        prescribed_rpe: config.rpe,
        rest_seconds: config.restSeconds,
        to_failure: false,
        notes: e.execution_tips ?? undefined,
      };
    }),
  });

  // ACCESSORY BLOCK (2-4 isolation exercises)
  const usedIdsAll = new Set([...usedIds, ...mainExercises.map(e => e.id)]);
  const accessoryPool = exercisePool.filter(e => !usedIdsAll.has(e.id));
  const accessoryExercises = selectExercises(accessoryPool, availableGroups, 'isolation', 3, profileName);

  blocks.push({
    block_type: 'accessory',
    exercises: accessoryExercises.map(e => {
      const config = getBlockSetsReps('accessory', focus, e.movement_type);
      const useIntensity = canApplyIntensityTechnique(e) && Math.random() > 0.5;
      const technique = useIntensity
        ? INTENSITY_TECHNIQUES[Math.floor(Math.random() * INTENSITY_TECHNIQUES.length)]
        : undefined;

      return {
        exercise_id: e.id,
        exercise_name: e.name,
        block_type: 'accessory',
        order_index: orderIndex++,
        prescribed_sets: config.sets,
        prescribed_reps: config.reps,
        prescribed_rpe: config.rpe,
        rest_seconds: config.restSeconds,
        intensity_technique: technique,
        to_failure: canGoToFailure(e),
        notes: e.execution_tips ?? undefined,
      };
    }),
  });

  // FINISHER BLOCK (0-1 exercise, optional)
  if (focus !== 'recovery' && Math.random() > 0.3) {
    const finisherPool = exercisePool.filter(e => !usedIdsAll.has(e.id) && !accessoryExercises.some(a => a.id === e.id));
    const finisherExercises = selectExercises(finisherPool, availableGroups, 'any', 1, profileName);

    if (finisherExercises.length > 0) {
      blocks.push({
        block_type: 'finisher',
        exercises: finisherExercises.map(e => {
          const config = getBlockSetsReps('finisher', focus, e.movement_type);
          return {
            exercise_id: e.id,
            exercise_name: e.name,
            block_type: 'finisher',
            order_index: orderIndex++,
            prescribed_sets: config.sets,
            prescribed_reps: config.reps,
            prescribed_rpe: config.rpe,
            rest_seconds: config.restSeconds,
            to_failure: false,
            notes: e.execution_tips ?? undefined,
          };
        }),
      });
    }
  }

  return blocks;
}
