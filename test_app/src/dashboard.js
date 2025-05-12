import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";
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
const db = getDatabase(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in. Redirecting to login.");
    window.location.href = "../auth/login.html";
    return;
  }

  const uid = user.uid;

  try {
    const picSnap = await get(ref(db, `users/${uid}/profilePicture`));
    if (picSnap.exists()) {
      const profileImgEl = document.getElementById("userProfilePic");
      if (profileImgEl) profileImgEl.src = picSnap.val();
    }
  } catch (err) {
    console.error("Error fetching profile picture:", err);
  }

  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    const data = snapshot.val();

    if (!data?.resumeUploaded) {
      alert("Please complete your resume first.");
      window.location.href = "../auth/uploadresume.html";
    } else if (!data?.careerInfoCompleted) {
      alert("Please complete your career info.");
      window.location.href = "../auth/uploadcareerinfo.html";
    } else {
      console.log("Access granted to dashboard.");
      getUserFirstName(uid, data);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Something went wrong checking your info.");
  }
});

function getUserFirstName(uid, userData) {
  const userRef = ref(db, `users/${uid}`);
  const resumeRef = ref(db, `users/${uid}/resume`);

  get(resumeRef)
    .then(async (resumeSnap) => {
      if (!resumeSnap.exists()) return;

      const resumeData = resumeSnap.val();
      const fullName = resumeData.fullName?.trim() || "";

      const firstName = fullName.split(' ')[0]; 

      const welcomeEl = document.getElementById("welcome");

      if (welcomeEl) {
        if (firstName) {  
          if (userData.firstTime) {
            welcomeEl.innerText = `Welcome, ${firstName}!`;  

            const firstLoginTime = new Date().toISOString();

            await update(userRef, {
              firstTime: false,  
              firstLoginTimestamp: firstLoginTime
            });

            console.log("🎉 First-time login recorded:", firstLoginTime);
          } else {
            welcomeEl.innerText = `Welcome back, ${firstName}`;  
          }
        } else {
          console.error("Full name is missing or invalid:", fullName);
          welcomeEl.innerText = "Welcome!";
        }
      } else {
        console.error('Welcome element not found in the DOM!');
      }
    })
    .catch((error) => {
      console.error("Error fetching full name:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
});