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
  
  // apiKey: "YOUR_API_KEY",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "your-id",
  // appId: "your-app-id"

  /*
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAnalytics } from "firebase/analytics";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCceq8ZYJvjSHYxumg9OkpJpFLuQohd-8U",
    authDomain: "guilddev-143af.firebaseapp.com",
    projectId: "guilddev-143af",
    storageBucket: "guilddev-143af.firebasestorage.app",
    messagingSenderId: "578632253346",
    appId: "1:578632253346:web:9993ffed21245e45b47cfb",
    measurementId: "G-W3XNWEHFTE"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  */


};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);