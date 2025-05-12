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
  const form = document.querySelector("form");

 
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.warn("🚫 No user found, redirecting to index.html...");
      window.location.href = "../index.html";
      return;
    }

    console.log("✅ Authenticated user:", user.uid);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const jobTitle = document.getElementById("jobTitle").value.trim();
      const company = document.getElementById("company").value.trim();
      const years = document.getElementById("years").value.trim();
      const major = document.getElementById("major").value.trim();
      const interests = document.getElementById("interests").value.trim();
      const jobType = document.getElementById("jobType").value;
      const hasExperience = document.querySelector('input[name="hasExperience"]:checked')?.value || "no";
      const expDescription = document.getElementById("expDescription").value.trim();

      if (!jobTitle || !company || !years || !major || !interests || !jobType) {
        alert("Please fill in all the required fields.");
        return;
      }

      const userRef = ref(database, `users/${user.uid}/careerinfo`);

      const userRef2 = ref(database, `users/${user.uid}/`);

      update(userRef, {
        jobTitle,
        company,
        years,
        major,
        interests,
        jobType,
        hasExperience,
        expDescription,
        careerInfoCompleted: true
      })

      update(userRef2, {
        careerInfoCompleted: true
      })

        .then(() => {
          alert("Career info saved successfully!");
          window.location.href = "../dashboard/dashboard.html";
        })
        .catch((error) => {
          console.error("Error saving career info:", error);
          alert("Failed to save career info.");
        });
    });
  });
});
