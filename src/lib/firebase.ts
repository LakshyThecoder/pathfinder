'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase
if (getApps().length === 0) {
  // Check if all config keys are present
  if (Object.values(firebaseConfig).some(value => !value)) {
    console.error("Firebase configuration is incomplete. Check your .env.local file for NEXT_PUBLIC_ variables.");
    // @ts-ignore
    app = {}; // Assign a dummy object to prevent further errors on the client.
  } else {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
    console.error("Error initializing Firebase Auth or Firestore on the client.", e)
    // @ts-ignore
    auth = {};
    // @ts-ignore
    db = {};
}


const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
