// Import Firebase dependencies
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your Firebase Configuration (Replace with actual credentials)
const firebaseConfig = {
    apiKey: "AIzaSyDwUtdCi1Wz-meVdKagFZ2OXLyxAUsUiAc",
    authDomain: "code-box-ee11f.firebaseapp.com",
    databaseURL: "https://code-box-ee11f-default-rtdb.firebaseio.com",
    projectId: "code-box-ee11f",
    storageBucket: "code-box-ee11f.appspot.com",
    messagingSenderId: "956121181787",
    appId: "1:956121181787:web:7e2126bd435a4ad871597e"
  };

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(firebaseApp); // Firebase Authentication
const database = getDatabase(firebaseApp); // Firebase Realtime Database

// Export Firebase instances
export { firebaseApp, auth, db };
