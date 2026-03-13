import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbVfDub0QNVhW42g-ZgpDCWpsKMF_c5xo",
  authDomain: "quizmaster-4363c.firebaseapp.com",
  projectId: "quizmaster-4363c",
  storageBucket: "quizmaster-4363c.firebasestorage.app",
  messagingSenderId: "159736305915",
  appId: "1:159736305915:web:546113f50d615b3d55385e",
  measurementId: "G-0VGNCQWD53",
  databaseURL: "https://quizmaster-4363c-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
console.log("Firebase Initialized for project:", firebaseConfig.projectId);
