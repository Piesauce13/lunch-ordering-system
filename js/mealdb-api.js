// Base URL 
const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

// Fetch all categories
export async function fetchCategories() {
  try {
    const res = await fetch(`${MEALDB_BASE}/categories.php`);
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}


// Fetch meals list by category 
export async function fetchMealsByCategory(category) {
  try {
    const res = await fetch(`${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    console.error("fetchMealsByCategory error:", err);
    return [];
  }
}

// Fetch full meal details by meal ID
export async function fetchMealById(mealId) {
  try {
    const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (err) {
    console.error("fetchMealById error:", err);
    return null;
  }
}

// Search meals by name
export async function searchMealsByName(name) {
  try {
    const res = await fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(name)}`);
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    console.error("searchMealsByName error:", err);
    return [];
  }
}

// Extract ingredients list from a full meal object
export function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
    }
  }
  return ingredients;
}