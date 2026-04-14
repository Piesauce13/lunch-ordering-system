import { fetchCategories, fetchMealsByCategory, fetchMealById, searchMealsByName } from "./mealdb-api.js";
import { validateOrderForm, showToast, showSpinner, toTitleCase, generateOrderNumber } from "./utils.js";
import firebaseService from "../Firebase/CRUD.js";

const currentUser = sessionStorage.getItem("currentUser");
if (!currentUser) window.location.href = "../index.html";

let selectedMeal = null; // full meal object currently selected

// DOM References — update IDs to match your receptionist.html
const categorySelect    = document.getElementById("categorySelect");
const mealGrid          = document.getElementById("mealGrid");
const searchInput       = document.getElementById("searchInput");
const searchBtn         = document.getElementById("searchBtn");
const orderForm         = document.getElementById("orderForm");
const employeeNameInput = document.getElementById("employeeName");
const quantityInput     = document.getElementById("quantity");
const notesInput        = document.getElementById("notes");
const selectedMealName  = document.getElementById("selectedMealName");
const selectedMealImg   = document.getElementById("selectedMealImg");
const submitBtn         = document.getElementById("submitBtn");

// 1. Init — runs when page loads
async function init() {
  showSpinner(true);
  await loadCategories();
  showSpinner(false);
}

// 2. Load categories into the dropdown
async function loadCategories() {
  const categories = await fetchCategories();

  categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.strCategory;
    option.textContent = cat.strCategory;
    categorySelect.appendChild(option);
  });
}

// 3. When category changes, load meals for that category
categorySelect.addEventListener("change", async () => {
  const category = categorySelect.value;
  if (!category) return;

  showSpinner(true);
  selectedMeal = null;
  clearSelectedMealPreview();

  const meals = await fetchMealsByCategory(category);
  renderMealCards(meals);
  showSpinner(false);
});

// 4. Search meals by name
searchBtn.addEventListener("click", async () => {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    showToast("Please enter a meal name to search.", "error");
    return;
  }

  showSpinner(true);
  selectedMeal = null;
  clearSelectedMealPreview();

  const meals = await searchMealsByName(keyword);
  if (meals.length === 0) {
    showToast("No meals found for that search.", "info");
    mealGrid.innerHTML = `<p class="no-results">No results found.</p>`;
  } else {
    renderMealCards(meals);
  }
  showSpinner(false);
});

// Also allow pressing Enter in search input
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// 5. Render meal cards in the grid
function renderMealCards(meals) {
  mealGrid.innerHTML = "";

  if (meals.length === 0) {
    mealGrid.innerHTML = `<p class="no-results">No meals available.</p>`;
    return;
  }

  meals.forEach(meal => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.dataset.id = meal.idMeal;

    card.innerHTML = `
      <img src="${meal.strMealThumb}/preview" alt="${meal.strMeal}" />
      <p>${meal.strMeal}</p>
    `;

    card.addEventListener("click", () => selectMeal(meal.idMeal, card));
    mealGrid.appendChild(card);
  });
}

// 6. When a meal card is clicked, fetch full details & preview
async function selectMeal(mealId, cardEl) {
  // Highlight selected card
  document.querySelectorAll(".meal-card").forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");

  showSpinner(true);
  const meal = await fetchMealById(mealId);
  showSpinner(false);

  if (!meal) {
    showToast("Could not load meal details.", "error");
    return;
  }

  selectedMeal = meal;

  // Show meal preview in the order form area
  if (selectedMealName) selectedMealName.textContent = meal.strMeal;
  if (selectedMealImg)  selectedMealImg.src = meal.strMealThumb;
}

// 7. Clear the meal preview
function clearSelectedMealPreview() {
  if (selectedMealName) selectedMealName.textContent = "None";
  if (selectedMealImg)  selectedMealImg.src = "";
  document.querySelectorAll(".meal-card").forEach(c => c.classList.remove("selected"));
}

// 8. Order form submission
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const employeeName = employeeNameInput.value.trim();
  const quantity     = parseInt(quantityInput.value);
  const notes        = notesInput ? notesInput.value.trim() : "";

  // Validate
  const { valid, message } = validateOrderForm({
    employeeName,
    mealId: selectedMeal ? selectedMeal.idMeal : null,
    quantity,
  });

  if (!valid) {
    showToast(message, "error");
    return;
  }

  // Submit to Firebase
  submitBtn.disabled = true;
  showSpinner(true);

  try {
    const orderId = await firebaseService.createOrder({
      orderNumber:  generateOrderNumber(),
      employeeName: toTitleCase(employeeName),
      status:       "pending",
      notes:        notes,
    });

    await firebaseService.createOrderItem({
      order_id:  orderId,
      mealId:    selectedMeal.idMeal,
      mealName:  selectedMeal.strMeal,
      mealThumb: selectedMeal.strMealThumb,
      quantity:  quantity,
    });

    showToast(`Order placed for ${toTitleCase(employeeName)}!`, "success");
    resetForm();
  } catch (err) {
    console.error("Order submission failed:", err);
    showToast("Failed to place order. Try again.", "error");
  } finally {
    submitBtn.disabled = false;
    showSpinner(false);
  }
});

// 9. Reset form after successful order
function resetForm() {
  orderForm.reset();
  selectedMeal = null;
  clearSelectedMealPreview();
  mealGrid.innerHTML = "";
  categorySelect.value = "";
}

// Start
document.addEventListener("DOMContentLoaded", init);