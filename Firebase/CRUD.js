import db from "./firebase_config";
import { 
    doc, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    updateDoc, 
    deleteDoc 
} from "firebase/firestore";

/* ================= USERS ================= */

// Create User
const createUser = async (user) => {
    try {
        const docRef = await addDoc(collection(db, "users"), user);
        return docRef.id;
    } catch (e) {
        console.error("Error creating user:", e);
    }
};

// Get All Users
const getUsers = async () => {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching users:", e);
    }
};

// Update User
const updateUser = async (id, data) => {
    try {
        const ref = doc(db, "users", id);
        await updateDoc(ref, data);
    } catch (e) {
        console.error("Error updating user:", e);
    }
};

// Delete User
const deleteUser = async (id) => {
    try {
        await deleteDoc(doc(db, "users", id));
    } catch (e) {
        console.error("Error deleting user:", e);
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
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// Create Order Item
const createOrderItem = async (item) => {
    try {
        const docRef = await addDoc(collection(db, "order_items"), item);
        return docRef.id;
    } catch (e) {
        console.error("Error creating order item:", e);
    }
};

// Get Items by Order ID
const getOrderItemsByOrder = async (orderId) => {
    try {
        const snapshot = await getDocs(collection(db, "order_items"));
        
        // filter manually (Firestore simple version)
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.order_id === orderId);

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
    // Users
    createUser,
    getUsers,
    updateUser,
    deleteUser,

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
