import { formatTime, formatDateTime, showToast, showSpinner } from "./utils.js";
import firebaseService from "../Firebase/CRUD.js";

const currentUser = sessionStorage.getItem("currentUser");
if (!currentUser) window.location.href = "../index.html";

let allOrders = [];
let currentFilter = "pending";

const orderListEl = document.getElementById("orderList");
const statusFilterSelect = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");
const pendingCountEl = document.getElementById("pendingCount");
const readyCountEl = document.getElementById("readyCount");
const completedCountEl = document.getElementById("completedCount");

async function init() {
  showSpinner(true);
  await loadOrders();
  showSpinner(false);
}

function updateStats(orders) {
  const pending = orders.filter(o => o.status === "pending").length;
  const ready = orders.filter(o => o.status === "ready").length;
  const completed = orders.filter(o => o.status === "completed").length;
  if (pendingCountEl) pendingCountEl.textContent = pending;
  if (readyCountEl) readyCountEl.textContent = ready;
  if (completedCountEl) completedCountEl.textContent = completed;
}

async function loadOrders() {
  try {
    const orders = await firebaseService.getOrders();
    allOrders = orders.sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
      const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
      return dateB - dateA;
    });
    updateStats(allOrders);
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
  card.className = `kitchen-card status-${order.status}`;

  const createdAt = order.created_at?.toDate?.() || new Date(order.created_at);
  const firstItem = items[0] || {};
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const itemsList = items.map(item => `
    <div class="item-row">
      <span class="item-qty">${item.quantity}x</span>
      <span class="item-name">${item.mealName}</span>
    </div>
  `).join("");

  const notesHtml = order.notes 
    ? `<div class="special-notes"><strong>Special Notes</strong>${order.notes}</div>`
    : `<div class="no-notes">No special instructions</div>`;

  const statusActions = getStatusActions(order.status, order.id);
  const statusLabel = { pending: "Pending", ready: "Ready", completed: "Done" }[order.status] || order.status;

  card.innerHTML = `
    <div class="kitchen-card-header">
      <img src="${firstItem.mealThumb || ''}/preview" alt="${firstItem.mealName || 'Meal'}" class="kitchen-card-img" />
      <div class="kitchen-card-info">
        <div class="kitchen-card-title">${firstItem.mealName || 'Unknown Meal'}</div>
        <span class="qty-badge">Qty: ${totalQty}</span>
      </div>
    </div>
    <div class="kitchen-card-body">
      <div class="order-meta-row">
        <span class="employee-name">${order.employeeName}</span>
        <span class="status-badge ${order.status}">${statusLabel}</span>
      </div>
      <div class="order-time">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        ${formatDateTime(createdAt)}
      </div>
      ${items.length > 1 ? `<div class="items-list">${itemsList}</div>` : ''}
      ${notesHtml}
      <div class="order-actions">${statusActions}</div>
    </div>
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
      return `
        <button class="btn-ready action-btn" ${baseAttr} data-status="ready">Mark Ready</button>
        <button class="btn-done action-btn" ${baseAttr} data-status="completed">Picked Up</button>
      `;
    case "ready":
      return `<button class="btn-done action-btn" ${baseAttr} data-status="completed">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Picked Up
      </button>`;
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
  statusFilterSelect.value = "pending";
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