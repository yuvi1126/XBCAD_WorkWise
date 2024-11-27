import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxeAOh60gsqz99GxfvHLfeK7Bfkf5OQZE",
  authDomain: "workwise-168e7.firebaseapp.com",
  projectId: "workwise-168e7",
  storageBucket: "workwise-168e7.firebasestorage.app",
  messagingSenderId: "854328582797",
  appId: "1:854328582797:web:5d95a46665c1a0678b78c4",
  measurementId: "G-0194RQE1P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
