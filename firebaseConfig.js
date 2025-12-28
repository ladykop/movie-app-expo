// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHYtUwI8xBYUUCN2PkzgPXaevGSpf7DrE",
  authDomain: "movieapp-933b9.firebaseapp.com",
  projectId: "movieapp-933b9",
  storageBucket: "movieapp-933b9.firebasestorage.app",
  messagingSenderId: "518030021020",
  appId: "1:518030021020:web:1ffdcdaef4db2628d03859",
  measurementId: "G-7XBHCPC9KW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);