export const ingredientsSeed = [
  // ──────────────────────────────────────────────
  // PROTEINS (acougue)
  // ──────────────────────────────────────────────
  { id: 1, name: 'chicken_breast', name_pt: 'Peito de Frango', category: 'protein', store_section: 'acougue', protein_per_100g: 31.0, carb_per_100g: 0.0, fat_per_100g: 3.6, calories_per_100g: 159, is_allowed: true, allergen_tags: [] },
  { id: 2, name: 'chicken_thigh', name_pt: 'Coxa de Frango', category: 'protein', store_section: 'acougue', protein_per_100g: 26.0, carb_per_100g: 0.0, fat_per_100g: 10.9, calories_per_100g: 209, is_allowed: true, allergen_tags: [] },
  { id: 3, name: 'ground_beef', name_pt: 'Carne Moída', category: 'protein', store_section: 'acougue', protein_per_100g: 26.1, carb_per_100g: 0.0, fat_per_100g: 15.0, calories_per_100g: 248, is_allowed: true, allergen_tags: [] },
  { id: 4, name: 'top_sirloin', name_pt: 'Alcatra', category: 'protein', store_section: 'acougue', protein_per_100g: 28.0, carb_per_100g: 0.0, fat_per_100g: 7.3, calories_per_100g: 182, is_allowed: true, allergen_tags: [] },
  { id: 5, name: 'salmon', name_pt: 'Salmão', category: 'protein', store_section: 'acougue', protein_per_100g: 20.4, carb_per_100g: 0.0, fat_per_100g: 13.4, calories_per_100g: 208, is_allowed: true, allergen_tags: ['fish'] },
  { id: 6, name: 'tilapia', name_pt: 'Tilápia', category: 'protein', store_section: 'acougue', protein_per_100g: 26.2, carb_per_100g: 0.0, fat_per_100g: 2.7, calories_per_100g: 128, is_allowed: true, allergen_tags: ['fish'] },
  { id: 7, name: 'shrimp', name_pt: 'Camarão', category: 'protein', store_section: 'acougue', protein_per_100g: 24.0, carb_per_100g: 0.2, fat_per_100g: 1.7, calories_per_100g: 119, is_allowed: true, allergen_tags: ['shellfish'] },
  { id: 8, name: 'egg', name_pt: 'Ovo', category: 'protein', store_section: 'acougue', protein_per_100g: 13.0, carb_per_100g: 1.1, fat_per_100g: 11.0, calories_per_100g: 155, is_allowed: true, allergen_tags: ['egg'] },
  { id: 9, name: 'egg_white', name_pt: 'Clara de Ovo', category: 'protein', store_section: 'acougue', protein_per_100g: 11.0, carb_per_100g: 0.7, fat_per_100g: 0.2, calories_per_100g: 52, is_allowed: true, allergen_tags: ['egg'] },
  { id: 10, name: 'turkey', name_pt: 'Peru', category: 'protein', store_section: 'acougue', protein_per_100g: 29.0, carb_per_100g: 0.0, fat_per_100g: 1.0, calories_per_100g: 135, is_allowed: true, allergen_tags: [] },
  { id: 11, name: 'pork_loin', name_pt: 'Lombo Suíno', category: 'protein', store_section: 'acougue', protein_per_100g: 27.3, carb_per_100g: 0.0, fat_per_100g: 3.5, calories_per_100g: 143, is_allowed: true, allergen_tags: [] },
  { id: 12, name: 'cod', name_pt: 'Bacalhau', category: 'protein', store_section: 'acougue', protein_per_100g: 29.0, carb_per_100g: 0.0, fat_per_100g: 0.7, calories_per_100g: 130, is_allowed: true, allergen_tags: ['fish'] },
  { id: 13, name: 'tuna', name_pt: 'Atum', category: 'protein', store_section: 'acougue', protein_per_100g: 30.0, carb_per_100g: 0.0, fat_per_100g: 0.6, calories_per_100g: 132, is_allowed: true, allergen_tags: ['fish'] },
  { id: 14, name: 'sardine', name_pt: 'Sardinha', category: 'protein', store_section: 'acougue', protein_per_100g: 24.6, carb_per_100g: 0.0, fat_per_100g: 11.5, calories_per_100g: 208, is_allowed: true, allergen_tags: ['fish'] },
  { id: 15, name: 'whey_protein', name_pt: 'Whey Protein', category: 'protein', store_section: 'mercearia', protein_per_100g: 80.0, carb_per_100g: 5.0, fat_per_100g: 3.0, calories_per_100g: 370, is_allowed: true, allergen_tags: ['cow_milk'] },

  // ──────────────────────────────────────────────
  // VEGETABLES (hortifruti)
  // ──────────────────────────────────────────────
  { id: 16, name: 'broccoli', name_pt: 'Brócolis', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 2.8, carb_per_100g: 6.6, fat_per_100g: 0.4, calories_per_100g: 34, is_allowed: true, allergen_tags: [] },
  { id: 17, name: 'spinach', name_pt: 'Espinafre', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 2.9, carb_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 23, is_allowed: true, allergen_tags: [] },
  { id: 18, name: 'kale', name_pt: 'Couve', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 2.9, carb_per_100g: 4.4, fat_per_100g: 0.6, calories_per_100g: 27, is_allowed: true, allergen_tags: [] },
  { id: 19, name: 'arugula', name_pt: 'Rúcula', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 2.6, carb_per_100g: 3.7, fat_per_100g: 0.7, calories_per_100g: 25, is_allowed: true, allergen_tags: [] },
  { id: 20, name: 'zucchini', name_pt: 'Abobrinha', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.2, carb_per_100g: 3.1, fat_per_100g: 0.3, calories_per_100g: 17, is_allowed: true, allergen_tags: [] },
  { id: 21, name: 'cauliflower', name_pt: 'Couve-flor', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.9, carb_per_100g: 5.0, fat_per_100g: 0.3, calories_per_100g: 25, is_allowed: true, allergen_tags: [] },
  { id: 22, name: 'bell_pepper', name_pt: 'Pimentão', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 0.9, carb_per_100g: 6.0, fat_per_100g: 0.3, calories_per_100g: 26, is_allowed: true, allergen_tags: [] },
  { id: 23, name: 'tomato', name_pt: 'Tomate', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 0.9, carb_per_100g: 3.9, fat_per_100g: 0.2, calories_per_100g: 18, is_allowed: true, allergen_tags: [] },
  { id: 24, name: 'cucumber', name_pt: 'Pepino', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 0.7, carb_per_100g: 3.6, fat_per_100g: 0.1, calories_per_100g: 15, is_allowed: true, allergen_tags: [] },
  { id: 25, name: 'lettuce', name_pt: 'Alface', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.4, carb_per_100g: 2.9, fat_per_100g: 0.2, calories_per_100g: 15, is_allowed: true, allergen_tags: [] },
  { id: 26, name: 'cabbage', name_pt: 'Repolho', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.3, carb_per_100g: 5.8, fat_per_100g: 0.1, calories_per_100g: 25, is_allowed: true, allergen_tags: [] },
  { id: 27, name: 'asparagus', name_pt: 'Aspargos', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 2.2, carb_per_100g: 3.9, fat_per_100g: 0.1, calories_per_100g: 20, is_allowed: true, allergen_tags: [] },
  { id: 28, name: 'green_beans', name_pt: 'Vagem', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.8, carb_per_100g: 7.0, fat_per_100g: 0.1, calories_per_100g: 31, is_allowed: true, allergen_tags: [] },
  { id: 29, name: 'beet', name_pt: 'Beterraba', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.6, carb_per_100g: 9.6, fat_per_100g: 0.2, calories_per_100g: 43, is_allowed: true, allergen_tags: [] },
  { id: 30, name: 'carrot', name_pt: 'Cenoura', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 0.9, carb_per_100g: 9.6, fat_per_100g: 0.2, calories_per_100g: 41, is_allowed: true, allergen_tags: [] },
  { id: 31, name: 'pumpkin', name_pt: 'Abóbora', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.0, carb_per_100g: 6.5, fat_per_100g: 0.1, calories_per_100g: 26, is_allowed: true, allergen_tags: [] },
  { id: 32, name: 'chayote', name_pt: 'Chuchu', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 0.8, carb_per_100g: 4.5, fat_per_100g: 0.1, calories_per_100g: 19, is_allowed: true, allergen_tags: [] },
  { id: 33, name: 'eggplant', name_pt: 'Berinjela', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.0, carb_per_100g: 5.9, fat_per_100g: 0.2, calories_per_100g: 25, is_allowed: true, allergen_tags: [] },
  { id: 34, name: 'mushroom', name_pt: 'Cogumelo', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 3.1, carb_per_100g: 3.3, fat_per_100g: 0.3, calories_per_100g: 22, is_allowed: true, allergen_tags: [] },
  { id: 35, name: 'onion', name_pt: 'Cebola', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 1.1, carb_per_100g: 9.3, fat_per_100g: 0.1, calories_per_100g: 40, is_allowed: true, allergen_tags: [] },
  { id: 36, name: 'garlic', name_pt: 'Alho', category: 'vegetable', store_section: 'hortifruti', protein_per_100g: 6.4, carb_per_100g: 33.1, fat_per_100g: 0.5, calories_per_100g: 149, is_allowed: true, allergen_tags: [] },

  // ──────────────────────────────────────────────
  // CARBS (graos / hortifruti)
  // ──────────────────────────────────────────────
  { id: 37, name: 'sweet_potato', name_pt: 'Batata Doce', category: 'carb', store_section: 'hortifruti', protein_per_100g: 1.6, carb_per_100g: 20.1, fat_per_100g: 0.1, calories_per_100g: 86, is_allowed: true, allergen_tags: [] },
  { id: 38, name: 'brown_rice', name_pt: 'Arroz Integral', category: 'carb', store_section: 'graos', protein_per_100g: 2.6, carb_per_100g: 25.8, fat_per_100g: 0.9, calories_per_100g: 111, is_allowed: true, allergen_tags: [] },
  { id: 39, name: 'white_rice', name_pt: 'Arroz Branco', category: 'carb', store_section: 'graos', protein_per_100g: 2.5, carb_per_100g: 28.2, fat_per_100g: 0.3, calories_per_100g: 130, is_allowed: true, allergen_tags: [] },
  { id: 40, name: 'tapioca', name_pt: 'Tapioca', category: 'carb', store_section: 'graos', protein_per_100g: 0.5, carb_per_100g: 22.0, fat_per_100g: 0.1, calories_per_100g: 88, is_allowed: true, allergen_tags: [] },
  { id: 41, name: 'gluten_free_oats', name_pt: 'Aveia sem Glúten', category: 'carb', store_section: 'graos', protein_per_100g: 13.2, carb_per_100g: 56.0, fat_per_100g: 6.9, calories_per_100g: 379, is_allowed: true, allergen_tags: [] },
  { id: 42, name: 'cassava', name_pt: 'Mandioca', category: 'carb', store_section: 'hortifruti', protein_per_100g: 1.4, carb_per_100g: 38.1, fat_per_100g: 0.3, calories_per_100g: 160, is_allowed: true, allergen_tags: [] },
  { id: 43, name: 'banana', name_pt: 'Banana', category: 'carb', store_section: 'hortifruti', protein_per_100g: 1.1, carb_per_100g: 22.8, fat_per_100g: 0.3, calories_per_100g: 89, is_allowed: true, allergen_tags: [] },
  { id: 44, name: 'yam', name_pt: 'Inhame', category: 'carb', store_section: 'hortifruti', protein_per_100g: 1.5, carb_per_100g: 27.9, fat_per_100g: 0.2, calories_per_100g: 118, is_allowed: true, allergen_tags: [] },
  { id: 45, name: 'quinoa', name_pt: 'Quinoa', category: 'carb', store_section: 'graos', protein_per_100g: 4.4, carb_per_100g: 21.3, fat_per_100g: 1.9, calories_per_100g: 120, is_allowed: true, allergen_tags: [] },
  { id: 46, name: 'rice_flour', name_pt: 'Farinha de Arroz', category: 'carb', store_section: 'graos', protein_per_100g: 5.9, carb_per_100g: 80.1, fat_per_100g: 1.4, calories_per_100g: 366, is_allowed: true, allergen_tags: [] },
  { id: 47, name: 'coconut_flour', name_pt: 'Farinha de Coco', category: 'carb', store_section: 'graos', protein_per_100g: 19.3, carb_per_100g: 26.7, fat_per_100g: 14.7, calories_per_100g: 330, is_allowed: true, allergen_tags: ['coconut'] },
  { id: 48, name: 'almond_flour', name_pt: 'Farinha de Amêndoas', category: 'carb', store_section: 'graos', protein_per_100g: 21.2, carb_per_100g: 19.7, fat_per_100g: 50.6, calories_per_100g: 590, is_allowed: true, allergen_tags: ['tree_nut'] },

  // ──────────────────────────────────────────────
  // FATS (mercearia / graos)
  // ──────────────────────────────────────────────
  { id: 49, name: 'extra_virgin_olive_oil', name_pt: 'Azeite Extra Virgem', category: 'fat', store_section: 'mercearia', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 100.0, calories_per_100g: 884, is_allowed: true, allergen_tags: [] },
  { id: 50, name: 'coconut_oil', name_pt: 'Óleo de Coco', category: 'fat', store_section: 'mercearia', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 100.0, calories_per_100g: 862, is_allowed: true, allergen_tags: ['coconut'] },
  { id: 51, name: 'avocado', name_pt: 'Abacate', category: 'fat', store_section: 'hortifruti', protein_per_100g: 2.0, carb_per_100g: 8.5, fat_per_100g: 14.7, calories_per_100g: 160, is_allowed: true, allergen_tags: [] },
  { id: 52, name: 'brazil_nut', name_pt: 'Castanha do Pará', category: 'fat', store_section: 'graos', protein_per_100g: 14.3, carb_per_100g: 12.3, fat_per_100g: 67.1, calories_per_100g: 656, is_allowed: true, allergen_tags: ['tree_nut'] },
  { id: 53, name: 'cashew', name_pt: 'Castanha de Caju', category: 'fat', store_section: 'graos', protein_per_100g: 18.2, carb_per_100g: 30.2, fat_per_100g: 43.9, calories_per_100g: 553, is_allowed: true, allergen_tags: ['tree_nut'] },
  { id: 54, name: 'walnuts', name_pt: 'Nozes', category: 'fat', store_section: 'graos', protein_per_100g: 15.2, carb_per_100g: 13.7, fat_per_100g: 65.2, calories_per_100g: 654, is_allowed: true, allergen_tags: ['tree_nut'] },
  { id: 55, name: 'almonds', name_pt: 'Amêndoas', category: 'fat', store_section: 'graos', protein_per_100g: 21.2, carb_per_100g: 21.7, fat_per_100g: 49.4, calories_per_100g: 575, is_allowed: true, allergen_tags: ['tree_nut'] },
  { id: 56, name: 'chia_seeds', name_pt: 'Semente de Chia', category: 'fat', store_section: 'graos', protein_per_100g: 16.5, carb_per_100g: 42.1, fat_per_100g: 30.7, calories_per_100g: 486, is_allowed: true, allergen_tags: [] },
  { id: 57, name: 'flax_seeds', name_pt: 'Semente de Linhaça', category: 'fat', store_section: 'graos', protein_per_100g: 18.3, carb_per_100g: 28.9, fat_per_100g: 42.2, calories_per_100g: 534, is_allowed: true, allergen_tags: [] },
  { id: 58, name: 'pumpkin_seeds', name_pt: 'Semente de Abóbora', category: 'fat', store_section: 'graos', protein_per_100g: 30.2, carb_per_100g: 10.7, fat_per_100g: 49.1, calories_per_100g: 559, is_allowed: true, allergen_tags: [] },
  { id: 59, name: 'tahini', name_pt: 'Tahine', category: 'fat', store_section: 'mercearia', protein_per_100g: 17.0, carb_per_100g: 21.2, fat_per_100g: 53.8, calories_per_100g: 595, is_allowed: true, allergen_tags: ['sesame'] },
  { id: 60, name: 'butter', name_pt: 'Manteiga', category: 'fat', store_section: 'laticinios', protein_per_100g: 0.9, carb_per_100g: 0.1, fat_per_100g: 81.1, calories_per_100g: 717, is_allowed: true, allergen_tags: [] },
  { id: 61, name: 'ghee', name_pt: 'Ghee', category: 'fat', store_section: 'mercearia', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 99.5, calories_per_100g: 876, is_allowed: true, allergen_tags: [] },

  // ──────────────────────────────────────────────
  // DAIRY ALTERNATIVES (laticinios)
  // ──────────────────────────────────────────────
  { id: 62, name: 'coconut_milk', name_pt: 'Leite de Coco', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 0.2, carb_per_100g: 2.7, fat_per_100g: 2.1, calories_per_100g: 30, is_allowed: true, allergen_tags: ['coconut'] },
  { id: 63, name: 'almond_milk', name_pt: 'Leite de Amêndoas', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 0.6, carb_per_100g: 3.4, fat_per_100g: 1.1, calories_per_100g: 17, is_allowed: true, allergen_tags: ['tree_nut'] },
  { id: 64, name: 'buffalo_cheese', name_pt: 'Queijo de Búfala', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 22.0, carb_per_100g: 0.5, fat_per_100g: 22.0, calories_per_100g: 290, is_allowed: true, allergen_tags: [] },
  { id: 65, name: 'goat_cheese', name_pt: 'Queijo de Cabra', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 21.6, carb_per_100g: 0.1, fat_per_100g: 21.1, calories_per_100g: 280, is_allowed: true, allergen_tags: [] },
  { id: 66, name: 'a2_casein', name_pt: 'Caseína A2', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 3.5, carb_per_100g: 4.7, fat_per_100g: 3.6, calories_per_100g: 64, is_allowed: true, allergen_tags: ['a2_casein'] },
  { id: 67, name: 'coconut_yogurt', name_pt: 'Iogurte de Coco', category: 'dairy_alt', store_section: 'laticinios', protein_per_100g: 0.8, carb_per_100g: 7.0, fat_per_100g: 5.0, calories_per_100g: 75, is_allowed: true, allergen_tags: ['coconut'] },

  // ──────────────────────────────────────────────
  // FRUITS (hortifruti)
  // ──────────────────────────────────────────────
  { id: 68, name: 'strawberry', name_pt: 'Morango', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.7, carb_per_100g: 7.7, fat_per_100g: 0.3, calories_per_100g: 32, is_allowed: true, allergen_tags: [] },
  { id: 69, name: 'blueberry', name_pt: 'Mirtilo', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.7, carb_per_100g: 14.5, fat_per_100g: 0.3, calories_per_100g: 57, is_allowed: true, allergen_tags: [] },
  { id: 70, name: 'raspberry', name_pt: 'Framboesa', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 1.2, carb_per_100g: 11.9, fat_per_100g: 0.7, calories_per_100g: 52, is_allowed: true, allergen_tags: [] },
  { id: 71, name: 'mango', name_pt: 'Manga', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.8, carb_per_100g: 15.0, fat_per_100g: 0.4, calories_per_100g: 60, is_allowed: true, allergen_tags: [] },
  { id: 72, name: 'papaya', name_pt: 'Mamão', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.5, carb_per_100g: 11.0, fat_per_100g: 0.3, calories_per_100g: 43, is_allowed: true, allergen_tags: [] },
  { id: 73, name: 'pineapple', name_pt: 'Abacaxi', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.5, carb_per_100g: 13.1, fat_per_100g: 0.1, calories_per_100g: 50, is_allowed: true, allergen_tags: [] },
  { id: 74, name: 'watermelon', name_pt: 'Melancia', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.6, carb_per_100g: 7.6, fat_per_100g: 0.2, calories_per_100g: 30, is_allowed: true, allergen_tags: [] },
  { id: 75, name: 'orange', name_pt: 'Laranja', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 0.9, carb_per_100g: 11.8, fat_per_100g: 0.1, calories_per_100g: 47, is_allowed: true, allergen_tags: [] },
  { id: 76, name: 'kiwi', name_pt: 'Kiwi', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 1.1, carb_per_100g: 14.7, fat_per_100g: 0.5, calories_per_100g: 61, is_allowed: true, allergen_tags: [] },
  { id: 77, name: 'passion_fruit', name_pt: 'Maracujá', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 2.2, carb_per_100g: 23.4, fat_per_100g: 0.7, calories_per_100g: 97, is_allowed: true, allergen_tags: [] },
  { id: 78, name: 'lemon', name_pt: 'Limão', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 1.1, carb_per_100g: 9.3, fat_per_100g: 0.3, calories_per_100g: 29, is_allowed: true, allergen_tags: [] },
  { id: 79, name: 'guava', name_pt: 'Goiaba', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 2.6, carb_per_100g: 14.3, fat_per_100g: 1.0, calories_per_100g: 68, is_allowed: true, allergen_tags: [] },
  { id: 80, name: 'acai', name_pt: 'Açaí', category: 'fruit', store_section: 'hortifruti', protein_per_100g: 1.3, carb_per_100g: 6.2, fat_per_100g: 5.0, calories_per_100g: 70, is_allowed: true, allergen_tags: [] },

  // ──────────────────────────────────────────────
  // SEASONINGS (temperos)
  // ──────────────────────────────────────────────
  { id: 81, name: 'himalayan_salt', name_pt: 'Sal do Himalaia', category: 'seasoning', store_section: 'temperos', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 0.0, calories_per_100g: 0, is_allowed: true, allergen_tags: [] },
  { id: 82, name: 'sea_salt', name_pt: 'Sal Marinho', category: 'seasoning', store_section: 'temperos', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 0.0, calories_per_100g: 0, is_allowed: true, allergen_tags: [] },
  { id: 83, name: 'black_pepper', name_pt: 'Pimenta Preta', category: 'seasoning', store_section: 'temperos', protein_per_100g: 10.4, carb_per_100g: 63.9, fat_per_100g: 3.3, calories_per_100g: 251, is_allowed: true, allergen_tags: [] },
  { id: 84, name: 'turmeric', name_pt: 'Cúrcuma', category: 'seasoning', store_section: 'temperos', protein_per_100g: 7.8, carb_per_100g: 64.9, fat_per_100g: 9.9, calories_per_100g: 354, is_allowed: true, allergen_tags: [] },
  { id: 85, name: 'cumin', name_pt: 'Cominho', category: 'seasoning', store_section: 'temperos', protein_per_100g: 17.8, carb_per_100g: 44.2, fat_per_100g: 22.3, calories_per_100g: 375, is_allowed: true, allergen_tags: [] },
  { id: 86, name: 'paprika', name_pt: 'Páprica', category: 'seasoning', store_section: 'temperos', protein_per_100g: 14.1, carb_per_100g: 53.9, fat_per_100g: 12.9, calories_per_100g: 282, is_allowed: true, allergen_tags: [] },
  { id: 87, name: 'oregano', name_pt: 'Orégano', category: 'seasoning', store_section: 'temperos', protein_per_100g: 9.0, carb_per_100g: 68.9, fat_per_100g: 4.3, calories_per_100g: 265, is_allowed: true, allergen_tags: [] },
  { id: 88, name: 'basil', name_pt: 'Manjericão', category: 'seasoning', store_section: 'temperos', protein_per_100g: 3.2, carb_per_100g: 2.7, fat_per_100g: 0.6, calories_per_100g: 23, is_allowed: true, allergen_tags: [] },
  { id: 89, name: 'rosemary', name_pt: 'Alecrim', category: 'seasoning', store_section: 'temperos', protein_per_100g: 3.3, carb_per_100g: 20.7, fat_per_100g: 5.9, calories_per_100g: 131, is_allowed: true, allergen_tags: [] },
  { id: 90, name: 'thyme', name_pt: 'Tomilho', category: 'seasoning', store_section: 'temperos', protein_per_100g: 5.6, carb_per_100g: 24.4, fat_per_100g: 1.7, calories_per_100g: 101, is_allowed: true, allergen_tags: [] },
  { id: 91, name: 'cinnamon', name_pt: 'Canela', category: 'seasoning', store_section: 'temperos', protein_per_100g: 4.0, carb_per_100g: 80.6, fat_per_100g: 1.2, calories_per_100g: 247, is_allowed: true, allergen_tags: [] },
  { id: 92, name: 'stevia', name_pt: 'Stevia', category: 'seasoning', store_section: 'temperos', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 0.0, calories_per_100g: 0, is_allowed: true, allergen_tags: [] },
  { id: 93, name: 'cocoa_powder', name_pt: 'Cacau em Pó', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 19.6, carb_per_100g: 57.9, fat_per_100g: 13.7, calories_per_100g: 228, is_allowed: true, allergen_tags: [] },

  // ──────────────────────────────────────────────
  // FERMENTED SOY (allowed) — mercearia
  // ──────────────────────────────────────────────
  { id: 94, name: 'tofu', name_pt: 'Tofu', category: 'protein', store_section: 'laticinios', protein_per_100g: 8.1, carb_per_100g: 1.9, fat_per_100g: 4.8, calories_per_100g: 76, is_allowed: true, allergen_tags: ['fermented_soy'] },
  { id: 95, name: 'miso', name_pt: 'Miso', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 11.7, carb_per_100g: 26.5, fat_per_100g: 6.0, calories_per_100g: 199, is_allowed: true, allergen_tags: ['fermented_soy'] },
  { id: 96, name: 'natto', name_pt: 'Natto', category: 'protein', store_section: 'laticinios', protein_per_100g: 17.7, carb_per_100g: 14.4, fat_per_100g: 11.0, calories_per_100g: 212, is_allowed: true, allergen_tags: ['fermented_soy'] },
  { id: 97, name: 'tempeh', name_pt: 'Tempeh', category: 'protein', store_section: 'laticinios', protein_per_100g: 18.5, carb_per_100g: 9.4, fat_per_100g: 11.0, calories_per_100g: 193, is_allowed: true, allergen_tags: ['fermented_soy'] },

  // ──────────────────────────────────────────────
  // ADDITIONAL ITEMS (mercearia / laticinios)
  // ──────────────────────────────────────────────
  { id: 98, name: 'coconut_water', name_pt: 'Água de Coco', category: 'fruit', store_section: 'mercearia', protein_per_100g: 0.7, carb_per_100g: 3.7, fat_per_100g: 0.2, calories_per_100g: 19, is_allowed: true, allergen_tags: ['coconut'] },
  { id: 99, name: 'lard', name_pt: 'Banha de Porco', category: 'fat', store_section: 'acougue', protein_per_100g: 0.0, carb_per_100g: 0.0, fat_per_100g: 100.0, calories_per_100g: 902, is_allowed: true, allergen_tags: [] },
  { id: 100, name: 'polvilho', name_pt: 'Polvilho', category: 'carb', store_section: 'graos', protein_per_100g: 0.5, carb_per_100g: 87.1, fat_per_100g: 0.2, calories_per_100g: 351, is_allowed: true, allergen_tags: [] },
  { id: 101, name: 'flax_flour', name_pt: 'Farinha de Linhaça', category: 'carb', store_section: 'graos', protein_per_100g: 14.1, carb_per_100g: 43.3, fat_per_100g: 32.3, calories_per_100g: 450, is_allowed: true, allergen_tags: [] },
  { id: 102, name: 'tomato_paste', name_pt: 'Extrato de Tomate', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 4.3, carb_per_100g: 18.9, fat_per_100g: 0.5, calories_per_100g: 82, is_allowed: true, allergen_tags: [] },
  { id: 103, name: 'apple_cider_vinegar', name_pt: 'Vinagre de Maçã', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 0.0, carb_per_100g: 0.9, fat_per_100g: 0.0, calories_per_100g: 21, is_allowed: true, allergen_tags: [] },
  { id: 104, name: 'coconut_cream', name_pt: 'Creme de Coco', category: 'fat', store_section: 'mercearia', protein_per_100g: 2.3, carb_per_100g: 6.7, fat_per_100g: 23.8, calories_per_100g: 230, is_allowed: true, allergen_tags: ['coconut'] },
  { id: 105, name: 'ginger', name_pt: 'Gengibre', category: 'seasoning', store_section: 'hortifruti', protein_per_100g: 1.8, carb_per_100g: 17.8, fat_per_100g: 0.8, calories_per_100g: 80, is_allowed: true, allergen_tags: [] },
  { id: 106, name: 'parsley', name_pt: 'Salsinha', category: 'seasoning', store_section: 'hortifruti', protein_per_100g: 3.0, carb_per_100g: 6.3, fat_per_100g: 0.8, calories_per_100g: 36, is_allowed: true, allergen_tags: [] },
  { id: 107, name: 'cilantro', name_pt: 'Coentro', category: 'seasoning', store_section: 'hortifruti', protein_per_100g: 2.1, carb_per_100g: 3.7, fat_per_100g: 0.5, calories_per_100g: 23, is_allowed: true, allergen_tags: [] },
  { id: 108, name: 'chili_pepper', name_pt: 'Pimenta Dedo-de-Moça', category: 'seasoning', store_section: 'hortifruti', protein_per_100g: 1.9, carb_per_100g: 8.8, fat_per_100g: 0.4, calories_per_100g: 40, is_allowed: true, allergen_tags: [] },
  { id: 109, name: 'dried_tomato', name_pt: 'Tomate Seco', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 14.1, carb_per_100g: 55.8, fat_per_100g: 3.0, calories_per_100g: 258, is_allowed: true, allergen_tags: [] },
  { id: 110, name: 'nutritional_yeast', name_pt: 'Levedura Nutricional', category: 'seasoning', store_section: 'mercearia', protein_per_100g: 50.0, carb_per_100g: 36.0, fat_per_100g: 4.0, calories_per_100g: 325, is_allowed: true, allergen_tags: [] },
];
