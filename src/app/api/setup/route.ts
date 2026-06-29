import { NextResponse } from 'next/server';
import { sql as vercelSql } from '@vercel/postgres';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { seed } from '@/db/seed';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    age INTEGER NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    height_m NUMERIC(3,2) NOT NULL,
    goal VARCHAR(50) NOT NULL,
    training_intensity VARCHAR(20) NOT NULL,
    trains_fasted BOOLEAN DEFAULT TRUE,
    training_time VARCHAR(20) DEFAULT 'morning',
    protein_target_g INTEGER NOT NULL,
    carb_target_g INTEGER NOT NULL,
    carb_target_low_g INTEGER,
    fat_target_g INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS food_restrictions (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    restriction_type VARCHAR(20) NOT NULL,
    item VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    duration_months INTEGER,
    start_date DATE
  )`,
  `CREATE TABLE IF NOT EXISTS training_preferences (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    modality VARCHAR(30) NOT NULL,
    days_per_week INTEGER,
    priority INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    name_pt VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    store_section VARCHAR(50) NOT NULL,
    protein_per_100g NUMERIC(5,2) NOT NULL,
    carb_per_100g NUMERIC(5,2) NOT NULL,
    fat_per_100g NUMERIC(5,2) NOT NULL,
    fiber_per_100g NUMERIC(5,2) DEFAULT 0,
    calories_per_100g NUMERIC(6,1) NOT NULL,
    is_allowed BOOLEAN DEFAULT TRUE,
    allergen_tags TEXT[],
    unit VARCHAR(20) DEFAULT 'g'
  )`,
  `CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    meal_slot VARCHAR(30) NOT NULL,
    tags TEXT[],
    prep_time_min INTEGER,
    is_batch_cookable BOOLEAN DEFAULT FALSE,
    servings INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS dish_ingredients (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
    quantity_g NUMERIC(7,2) NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    notes VARCHAR(200)
  )`,
  `CREATE TABLE IF NOT EXISTS menu_cycles (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    finalized_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS cycle_dishes (
    id SERIAL PRIMARY KEY,
    cycle_id INTEGER NOT NULL REFERENCES menu_cycles(id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    batch_quantity INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS daily_meal_assignments (
    id SERIAL PRIMARY KEY,
    cycle_id INTEGER NOT NULL REFERENCES menu_cycles(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id),
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    meal_slot VARCHAR(30) NOT NULL,
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    portion_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    protein_g NUMERIC(5,1),
    carb_g NUMERIC(5,1),
    fat_g NUMERIC(5,1),
    calories NUMERIC(6,1),
    is_high_carb_day BOOLEAN DEFAULT FALSE,
    CONSTRAINT daily_meal_unique UNIQUE(cycle_id, profile_id, date, meal_slot)
  )`,
  `CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_pt VARCHAR(200) NOT NULL,
    modality VARCHAR(30) NOT NULL,
    primary_muscles TEXT[] NOT NULL,
    secondary_muscles TEXT[],
    equipment TEXT[],
    movement_type VARCHAR(30),
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    video_url TEXT,
    thumbnail_url TEXT,
    execution_tips TEXT,
    avoid_with TEXT[],
    tags TEXT[]
  )`,
  `CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL,
    modality VARCHAR(30) NOT NULL,
    focus VARCHAR(50) NOT NULL,
    muscle_groups TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    notes TEXT,
    duration_min INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS session_exercises (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    block_type VARCHAR(20) NOT NULL,
    order_index INTEGER NOT NULL,
    prescribed_sets INTEGER,
    prescribed_reps VARCHAR(30),
    prescribed_weight_kg NUMERIC(5,1),
    prescribed_rpe NUMERIC(3,1),
    rest_seconds INTEGER,
    intensity_technique VARCHAR(50),
    to_failure BOOLEAN DEFAULT FALSE,
    superset_group VARCHAR(5),
    notes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS session_exercise_logs (
    id SERIAL PRIMARY KEY,
    session_exercise_id INTEGER NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    actual_reps INTEGER,
    actual_weight_kg NUMERIC(5,1),
    rpe NUMERIC(3,1),
    completed BOOLEAN DEFAULT TRUE,
    notes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS shopping_list_cache (
    id SERIAL PRIMARY KEY,
    cycle_id INTEGER NOT NULL REFERENCES menu_cycles(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
    total_quantity_g NUMERIC(8,1) NOT NULL,
    store_section VARCHAR(50) NOT NULL,
    checked BOOLEAN DEFAULT FALSE
  )`,
];

export async function POST() {
  const log: string[] = [];

  try {
    for (let i = 0; i < TABLES.length; i++) {
      await vercelSql.query(TABLES[i]);
      log.push(`Tabela ${i + 1}/${TABLES.length} OK`);
    }

    const result = await vercelSql`SELECT COUNT(*) as count FROM profiles`;
    const count = Number(result.rows[0].count);

    if (count > 0) {
      return NextResponse.json({ message: 'Tabelas criadas. Banco já possui dados — seed ignorado.', log });
    }

    log.push('Iniciando seed...');
    await seed();
    log.push('Seed concluído!');

    return NextResponse.json({ message: 'Setup completo! Tabelas criadas e dados inseridos.', log });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Erro no setup', details: String(error), log }, { status: 500 });
  }
}
