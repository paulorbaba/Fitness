// ─── Meal Slots ──────────────────────────────────────────────────────────────

export const MEAL_SLOTS = [
  { value: 'post_workout', label: 'Pós-treino' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'snack', label: 'Lanche' },
  { value: 'dinner', label: 'Jantar' },
] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number]['value'];

// ─── Modalities ──────────────────────────────────────────────────────────────

export const MODALITIES = [
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'hyrox', label: 'Hyrox' },
  { value: 'swimming', label: 'Natação' },
  { value: 'weightlifting', label: 'Musculação' },
] as const;

export type Modality = (typeof MODALITIES)[number]['value'];

// ─── Training Focuses ────────────────────────────────────────────────────────

export const TRAINING_FOCUSES = [
  'hypertrophy',
  'strength',
  'conditioning',
  'recovery',
  'skill',
] as const;

export type TrainingFocus = (typeof TRAINING_FOCUSES)[number];

// ─── Muscle Groups ───────────────────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'core',
  'anterior_deltoid',
  'lateral_deltoid',
  'posterior_deltoid',
  'traps',
  'lats',
  'rhomboids',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// ─── Block Types ─────────────────────────────────────────────────────────────

export const BLOCK_TYPES = [
  { value: 'warmup', label: 'Aquecimento', color: '#F59E0B' },
  { value: 'main', label: 'Principal', color: '#EF4444' },
  { value: 'accessory', label: 'Acessório', color: '#3B82F6' },
  { value: 'finisher', label: 'Finalizador', color: '#8B5CF6' },
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number]['value'];

// ─── Store Sections ──────────────────────────────────────────────────────────

export const STORE_SECTIONS = [
  { value: 'produce', label: 'Hortifruti' },
  { value: 'proteins', label: 'Carnes e Proteínas' },
  { value: 'dairy', label: 'Laticínios' },
  { value: 'grains', label: 'Grãos e Cereais' },
  { value: 'frozen', label: 'Congelados' },
  { value: 'canned', label: 'Enlatados e Conservas' },
  { value: 'condiments', label: 'Condimentos e Temperos' },
  { value: 'oils', label: 'Óleos e Azeites' },
  { value: 'bakery', label: 'Padaria' },
  { value: 'nuts', label: 'Castanhas e Oleaginosas' },
  { value: 'supplements', label: 'Suplementos' },
  { value: 'beverages', label: 'Bebidas' },
  { value: 'other', label: 'Outros' },
] as const;

export type StoreSection = (typeof STORE_SECTIONS)[number]['value'];

// ─── Intensity Techniques ────────────────────────────────────────────────────

export const INTENSITY_TECHNIQUES = [
  'drop_set',
  'rest_pause',
  'superset',
  'giant_set',
  'tempo',
  'pause_rep',
  'cluster_set',
  'myo_reps',
  'partial_reps',
  'eccentric_focus',
  'isometric_hold',
  'amrap',
  'emom',
] as const;

export type IntensityTechnique = (typeof INTENSITY_TECHNIQUES)[number];

// ─── Macro Slot Distribution ─────────────────────────────────────────────────
// How daily macro targets are split across the 4 meal slots (ratios sum to 1.0)

export const MACRO_SLOT_DISTRIBUTION = {
  post_workout: { protein: 0.30, carb: 0.40, fat: 0.15 },
  lunch: { protein: 0.30, carb: 0.30, fat: 0.30 },
  snack: { protein: 0.15, carb: 0.10, fat: 0.25 },
  dinner: { protein: 0.25, carb: 0.20, fat: 0.30 },
} as const;

export type MacroSlotDistribution = typeof MACRO_SLOT_DISTRIBUTION;
