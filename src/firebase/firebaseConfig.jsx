import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue,update } from "firebase/database";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdjapx1TbwAW1Cv5W-SHHKWcx8RmaGius",
  authDomain: "scan-inn-568d0.firebaseapp.com",
  projectId: "scan-inn-568d0",
  storageBucket: "scan-inn-568d0.firebasestorage.app",
  messagingSenderId: "370193814199",
  appId: "1:370193814199:web:49e5844dbc0ca32fac7332",
  measurementId: "G-79QW7LWPS5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
// Get Auth instance
const auth = getAuth(app);

// Create Auth Providers for Google and Facebook
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider , db, ref, get, set, onValue ,update};
