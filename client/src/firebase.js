// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-c4f71.firebaseapp.com",
  projectId: "mern-estate-c4f71",
  storageBucket: "mern-estate-c4f71.appspot.com",
  messagingSenderId: "204528733282",
  appId: "1:204528733282:web:638062ed6e7921b6f8d53b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);