// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBAbcv9S4IkNYpSr8TOFlXARReka3J8jEo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invicta2025-6a053.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invicta2025-6a053",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invicta2025-6a053.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "251765109893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:251765109893:web:8e4028c4abb437bd2f25ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
