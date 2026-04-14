// Format a JS Date or Firestore Timestamp to readable time
export function formatTime(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date); // handle Firestore Timestamp
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Format a JS Date to readable date + time
export function formatDateTime(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" })
    + " · " + formatTime(d);
}

// Capitalize the first letter of each word
export function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Validate order form fields before submission
export function validateOrderForm({ employeeName, mealId, quantity }) {
  if (!employeeName || employeeName.trim() === "") {
    return { valid: false, message: "Employee name is required." };
  }
  if (!mealId) {
    return { valid: false, message: "Please select a meal." };
  }
  if (!quantity || isNaN(quantity) || Number(quantity) < 1) {
    return { valid: false, message: "Quantity must be at least 1." };
  }
  return { valid: true, message: "" };
}

// Show a toast/alert message on the page
export function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// Show or hide a loading spinner
export function showSpinner(visible) {
  const spinner = document.getElementById("spinner");
  if (!spinner) return;
  spinner.style.display = visible ? "block" : "none";
}

// Generate a simple unique order number for display
export function generateOrderNumber() {
  return "ORD-" + Date.now();
}