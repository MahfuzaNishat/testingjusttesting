import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

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

  
  localStorage.removeItem("deleteIntent");

  
  const deleteIntent = localStorage.getItem("deleteIntent") === "true";
  
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log("✅ User signed in:", user.uid);

            const userRef = ref(database, "users/" + user.uid);

            get(userRef).then((snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("📄 User data:", data);

                // Redirect based on resume and career info completion
                if (!data.resumeUploaded) {
                  console.log("➡️ Redirecting to uploadresume.html");
                  window.location.href = "../user/uploadresume.html";
                } else if (!data.careerInfoCompleted) {
                  console.log("➡️ Redirecting to uploadcareerinfo.html");
                  window.location.href = "../user/uploadcareerinfo.html";
                } else {
                  console.log("➡️ Redirecting to dashboard.html");
                  window.location.href = "../dashboard/dashboard.html";
                }

                // If the user logged in to delete their account, prompt them again
                if (deleteIntent) {
                  const confirmed = confirm("You are logging in to delete your account. Are you sure?");
                  if (confirmed) {
                    // Proceed with account deletion
                    deleteUserAccount(user.uid);
                  }
                }
              } else {
                console.warn("⚠️ No user data found in database.");
              }
            }).catch((error) => {
              console.error("❌ Failed to get user data:", error);
            });
          })
          .catch((error) => {
            console.error("❌ Login failed:", error.message);
            alert("Login failed: " + error.message);
          });
      });
    })
    .catch((error) => {
      console.error("❌ Failed to set persistence:", error);
    });
});


function deleteUserAccount(uid) {
  const user = auth.currentUser;
  if (user) {
    
    const userRef = ref(database, "users/" + uid);
    set(userRef, null) 
      .then(() => {
        user.delete() 
          .then(() => {
            alert("Account deleted successfully.");
            localStorage.removeItem("deleteIntent"); 
            window.location.href = "../auth/index.html";
          })
          .catch((err) => {
            console.error("Error deleting user:", err);
            alert("Error deleting account.");
          });
      })
      .catch((err) => {
        console.error("Error removing user data:", err);
        alert("Error deleting account.");
      });
  }
}