import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.warn("🚫 Not authenticated. Redirecting to index...");
      window.location.href = "../index.html";
      return;
    }

    console.log("✅ Authenticated user:", user.uid);

    const form = document.querySelector("form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const skills = document.getElementById("skills").value.trim();
      const resumeURL = document.getElementById("resumeURL").value.trim();

      if (!name || !email || !skills || !resumeURL) {
        alert("Please fill in all the required fields.");
        return;
      }

      const userRef = ref(database, `users/${user.uid}/resume`);

      const userRef2 = ref(database, `users/${user.uid}/`);

      update(userRef, {
        fullName: name,
        email: email,
        skills: skills,
        resume: resumeURL
      })

      update(userRef2, {
        resumeUploaded: true
      })

        .then(() => {
          alert("Resume info saved!");
          window.location.href = "../user/uploadcareerinfo.html";
        })
        .catch((error) => {
          console.error("❌ Error saving resume info:", error);
          alert("Failed to save resume info.");
        });
    });
  });
});
