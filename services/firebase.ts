
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use process.env which is explicitly defined in vite.config.ts
const apiKey = process.env.VITE_FIREBASE_API_KEY;

let app;
let auth: any;
let googleProvider: any;
let facebookProvider: any;
let dbFirestore: any;
let storage: any;

// Helper to check if the key is likely a placeholder or invalid
const isInvalidKey = (key: string | undefined) => {
    if (!key) return true;
    if (key.includes("YOUR_API_KEY")) return true;
    if (key.includes("placeholder")) return true;
    // Firebase API keys are typically around 39 characters
    if (key.length < 30) return true;
    return false;
};

// Only initialize if we have a seemingly valid key
if (!isInvalidKey(apiKey)) {
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    dbFirestore = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn("Firebase initialization failed, likely due to invalid config. Falling back to mock.", error);
    // Explicitly nullify auth to trigger mock fallback in database.ts
    auth = undefined;
  }
} else {
  console.log("No valid Firebase API key found. Using Mock Database.");
}

// Export services (can be undefined if config is missing)
export { auth, googleProvider, facebookProvider, dbFirestore, storage };
