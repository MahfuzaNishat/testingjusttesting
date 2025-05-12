import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log("✅ User created:", user.uid);

            const userRef = ref(database, "users/" + user.uid);
            set(userRef, {
              email: email,
              accountCreated: true,
              resumeUploaded: false,
              careerInfoCompleted: false,
              firstTime: true
            })
              .then(() => {
                console.log("📄 User data saved to database.");
                window.location.href = "../user/uploadresume.html"; 
              })
              .catch((error) => {
                console.error("❌ Failed to save user data:", error);
                alert("Failed to save user data.");
              });
          })
          .catch((error) => {
            console.error("❌ Account creation failed:", error.message);
            alert("Account creation failed: " + error.message);
          });
      });
    })
    .catch((error) => {
      console.error("❌ Failed to set auth persistence:", error);
      alert("Failed to set persistence.");
    });
});