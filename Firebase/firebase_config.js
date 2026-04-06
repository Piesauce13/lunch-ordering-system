import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyDAf1o93WNRj2c97m5s5QbaE2k1tHdK6CY",
  authDomain: "resturant-menu-27740.firebaseapp.com",
  projectId: "resturant-menu-27740",
  storageBucket: "resturant-menu-27740.firebasestorage.app",
  messagingSenderId: "982132109234",
  appId: "1:982132109234:web:a6ee1d1102101782e0feab",
  measurementId: "G-DW5T5373JF"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);