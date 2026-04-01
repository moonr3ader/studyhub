// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCceq8ZYJvjSHYxumg9OkpJpFLuQohd-8U",
  authDomain: "guilddev-143af.firebaseapp.com",
  projectId: "guilddev-143af",
  storageBucket: "guilddev-143af.firebasestorage.app",
  messagingSenderId: "578632253346",
  appId: "1:578632253346:web:9993ffed21245e45b47cfb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);