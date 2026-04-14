import db from "./firebase_config.js";
import {
    doc, collection, addDoc, getDocs,
    updateDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= AUTH (SIMPLE LOGIN) ================= */

const login = async (name, password) => {
    try {
        const q = query(
            collection(db, "users"),
            where("name", "==", name),
            where("password", "==", password)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const user = snapshot.docs[0];
            return {
                success: true,
                user: { id: user.id, ...user.data() }
            };
        } else {
            return {
                success: false,
                message: "Invalid name or password"
            };
        }

    } catch (e) {
        console.error("Login error:", e);
        return { success: false };
    }
};


/* ================= MEALS ================= */

const createMeal = async (meal) => {
    try {
        const docRef = await addDoc(collection(db, "meals"), meal);
        return docRef.id;
    } catch (e) {
        console.error("Error creating meal:", e);
    }
};

const getMeals = async () => {
    try {
        const snapshot = await getDocs(collection(db, "meals"));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Error fetching meals:", e);
    }
};

const updateMeal = async (id, data) => {
    try {
        await updateDoc(doc(db, "meals", id), data);
    } catch (e) {
        console.error("Error updating meal:", e);
    }
};

const deleteMeal = async (id) => {
    try {
        await deleteDoc(doc(db, "meals", id));
    } catch (e) {
        console.error("Error deleting meal:", e);
    }
};


/* ================= ORDERS ================= */

const createOrder = async (order) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...order,
            created_at: new Date()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error creating order:", e);
    }
};

const getOrders = async () => {
    try {
        const snapshot = await getDocs(collection(db, "orders"));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Error fetching orders:", e);
    }
};

const updateOrder = async (id, data) => {
    try {
        await updateDoc(doc(db, "orders", id), data);
    } catch (e) {
        console.error("Error updating order:", e);
    }
};

const deleteOrder = async (id) => {
    try {
        await deleteDoc(doc(db, "orders", id));
    } catch (e) {
        console.error("Error deleting order:", e);
    }
};


/* ================= ORDER ITEMS ================= */

const createOrderItem = async (item) => {
    try {
        const docRef = await addDoc(collection(db, "order_items"), item);
        return docRef.id;
    } catch (e) {
        console.error("Error creating order item:", e);
    }
};

const getOrderItemsByOrder = async (orderId) => {
    try {
        const q = query(
            collection(db, "order_items"),
            where("order_id", "==", orderId)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (e) {
        console.error("Error fetching order items:", e);
    }
};

const updateOrderItem = async (id, data) => {
    try {
        await updateDoc(doc(db, "order_items", id), data);
    } catch (e) {
        console.error("Error updating order item:", e);
    }
};

const deleteOrderItem = async (id) => {
    try {
        await deleteDoc(doc(db, "order_items", id));
    } catch (e) {
        console.error("Error deleting order item:", e);
    }
};


/* ================= EXPORT ================= */

export default {
    // Auth
    login,

    // Meals
    createMeal,
    getMeals,
    updateMeal,
    deleteMeal,

    // Orders
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,

    // Order Items
    createOrderItem,
    getOrderItemsByOrder,
    updateOrderItem,
    deleteOrderItem
};
