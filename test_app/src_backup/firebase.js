// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getPerformance } from 'firebase/performance';
import { getDatabase } from 'firebase/database';
import { getRemoteConfig } from 'firebase/remote-config';
import { getAppCheck } from 'firebase/app-check';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5fhDLm0cV-q0L2oWxs6e0OwSU5gcggGI",
  authDomain: "test-bf20f.firebaseapp.com",
  databaseURL: "https://test-bf20f-default-rtdb.firebaseio.com",
  projectId: "test-bf20f",
  storageBucket: "test-bf20f.firebasestorage.app",
  messagingSenderId: "401115753366",
  appId: "1:401115753366:web:19db6e47b3e5cb9a404bb7",
  measurementId: "G-NN0J5Z1TL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const performance = getPerformance(app);
const database = getDatabase(app);
const remote = getRemoteConfig(app);
const appCheck = getAppCheck(app);