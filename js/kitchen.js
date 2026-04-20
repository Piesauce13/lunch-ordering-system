import { formatTime, formatDateTime, showToast, showSpinner } from "./utils.js";
import firebaseService from "../Firebase/CRUD.js";

const currentUser = sessionStorage.getItem("currentUser");
if (!currentUser) window.location.href = "../index.html";

let allOrders = [];
let currentFilter = "pending";

const orderListEl = document.getElementById("orderList");
const statusFilterSelect = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");

async function init() {
  showSpinner(true);
  await loadOrders();
  showSpinner(false);
}

async function loadOrders() {
  try {
    const orders = await firebaseService.getOrders();
    allOrders = orders.sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
      const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
      return dateB - dateA;
    });
    applyFilter(currentFilter);
  } catch (err) {
    console.error("Failed to load orders:", err);
    showToast("Failed to load orders", "error");
  }
}

async function applyFilter(status) {
  currentFilter = status;
  const filtered = status === "all" 
    ? allOrders 
    : allOrders.filter(o => o.status === status);
  renderOrders(filtered);
}

async function renderOrders(orders) {
  if (!orderListEl) return;
  orderListEl.innerHTML = "";

  if (orders.length === 0) {
    orderListEl.innerHTML = `<p class="no-orders">No orders found.</p>`;
    return;
  }

  for (const order of orders) {
    const items = await firebaseService.getOrderItemsByOrder(order.id);
    renderOrderCard(order, items);
  }
}

async function renderOrderCard(order, items) {
  const card = document.createElement("div");
  card.className = `order-card status-${order.status}`;

  const createdAt = order.created_at?.toDate?.() || new Date(order.created_at);
  
  const itemsHtml = items.map(item => `
    <li>
      <span class="item-qty">${item.quantity}x</span>
      <span class="item-name">${item.mealName}</span>
    </li>
  `).join("");

  const statusActions = getStatusActions(order.status, order.id);

  card.innerHTML = `
    <div class="order-header">
      <span class="order-number">${order.orderNumber}</span>
      <span class="order-status">${order.status}</span>
    </div>
    <div class="order-meta">
      <span class="employee-name">${order.employeeName}</span>
      <span class="order-time">${formatDateTime(createdAt)}</span>
    </div>
    <ul class="order-items">${itemsHtml}</ul>
    ${order.notes ? `<div class="order-notes">Note: ${order.notes}</div>` : ""}
    <div class="order-actions">${statusActions}</div>
  `;

  card.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const newStatus = e.target.dataset.status;
      const orderId = e.target.dataset.orderId;
      await updateOrderStatus(orderId, newStatus);
    });
  });

  orderListEl.appendChild(card);
}

function getStatusActions(status, orderId) {
  const baseAttr = `data-order-id="${orderId}"`;
  
  switch (status) {
    case "pending":
      return `<button class="action-btn start" ${baseAttr} data-status="preparing">Start Cooking</button>`;
    case "preparing":
      return `<button class="action-btn ready" ${baseAttr} data-status="ready">Mark Ready</button>`;
    case "ready":
      return `<button class="action-btn complete" ${baseAttr} data-status="completed">Complete</button>`;
    default:
      return "";
  }
}

async function updateOrderStatus(orderId, newStatus) {
  showSpinner(true);
  try {
    await firebaseService.updateOrder(orderId, { status: newStatus });
    showToast(`Order marked as ${newStatus}`, "success");
    await loadOrders();
  } catch (err) {
    console.error("Failed to update order:", err);
    showToast("Failed to update order", "error");
  } finally {
    showSpinner(false);
  }
}

if (statusFilterSelect) {
  statusFilterSelect.addEventListener("change", (e) => {
    applyFilter(e.target.value);
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    showSpinner(true);
    await loadOrders();
    showSpinner(false);
  });
}

document.addEventListener("DOMContentLoaded", init);
