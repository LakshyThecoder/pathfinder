'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvt9NrRatC35es0WDAp2IruLBhwT2yXMU",
  authDomain: "test-5ffcd.firebaseapp.com",
  projectId: "test-5ffcd",
  storageBucket: "test-5ffcd.appspot.com",
  messagingSenderId: "222158136147",
  appId: "1:222158136147:web:1f36d49d93c3b275be37a6",
  measurementId: "G-9VNPZLDKR2"
};


// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
