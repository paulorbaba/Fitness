export const profilesSeed = [
  {
    name: 'Paulo',
    age: 31,
    weight_kg: '69.00',
    height_m: '1.69',
    goal: 'lean_mass_gain',
    training_intensity: 'intense',
    trains_fasted: true,
    training_time: 'morning',
    protein_target_g: 150,
    carb_target_g: 260,
    carb_target_low_g: 190,
    fat_target_g: 95,
  },
  {
    name: 'Milena',
    age: 37,
    weight_kg: '60.00',
    height_m: '1.69',
    goal: 'reduce_bf_gain_lean',
    training_intensity: 'moderate',
    trains_fasted: true,
    training_time: 'morning',
    protein_target_g: 108,
    carb_target_g: 130,
    carb_target_low_g: null,
    fat_target_g: 68,
  },
];

export const pauloRestrictions = [
  { restriction_type: 'prohibited', item: 'refined_salt', category: 'salt' },
  { restriction_type: 'prohibited', item: 'sugar', category: 'sweetener' },
  { restriction_type: 'prohibited', item: 'artificial_sweetener', category: 'sweetener' },
  { restriction_type: 'prohibited', item: 'soda', category: 'beverage' },
  { restriction_type: 'prohibited', item: 'industrial_juice', category: 'beverage' },
  { restriction_type: 'prohibited', item: 'canola_oil', category: 'oil' },
  { restriction_type: 'prohibited', item: 'corn_oil', category: 'oil' },
  { restriction_type: 'prohibited', item: 'sunflower_oil', category: 'oil' },
  { restriction_type: 'prohibited', item: 'soy_oil', category: 'oil' },
  { restriction_type: 'prohibited', item: 'margarine', category: 'oil' },
  { restriction_type: 'prohibited', item: 'wheat', category: 'grain' },
  { restriction_type: 'prohibited', item: 'barley', category: 'grain' },
  { restriction_type: 'prohibited', item: 'rye', category: 'grain' },
  { restriction_type: 'prohibited', item: 'cow_milk', category: 'dairy' },
  { restriction_type: 'prohibited', item: 'unfermented_soy', category: 'legume' },
  { restriction_type: 'prohibited', item: 'corn', category: 'legume' },
  { restriction_type: 'prohibited', item: 'peanut', category: 'legume' },
];

export const milenaRestrictions = [
  ...pauloRestrictions,
  { restriction_type: 'prohibited', item: 'alcohol', category: 'beverage', duration_months: 6 },
];

export const pauloTrainingPreferences = [
  { modality: 'crossfit', days_per_week: 3, priority: 1 },
  { modality: 'weightlifting', days_per_week: 3, priority: 2 },
  { modality: 'hyrox', days_per_week: 1, priority: 3 },
  { modality: 'swimming', days_per_week: 1, priority: 4 },
];

export const milenaTrainingPreferences = [
  { modality: 'weightlifting', days_per_week: 3, priority: 1 },
];
