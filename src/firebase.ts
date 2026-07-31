import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAdAHhXresfNiZlgJU986nZ5NVjUNheLok",
  authDomain: "nyztrix-wolf.firebaseapp.com",
  projectId: "nyztrix-wolf",
  storageBucket: "nyztrix-wolf.firebasestorage.app",
  messagingSenderId: "6454113284",
  appId: "1:6454113284:web:aadc5941ed179b0d86b151",
  measurementId: "G-WZ0CHS7JRK",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (only in browser)
export let analytics: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
