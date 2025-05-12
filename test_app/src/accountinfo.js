import { getAuth, onAuthStateChanged, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA5fhDLm0cV-q0L2oWxs6e0OwSU5gcggGI",
  authDomain: "test-bf20f.firebaseapp.com",
  databaseURL: "https://test-bf20f-default-rtdb.firebaseio.com",
  projectId: "test-bf20f",
  storageBucket: "test-bf20f.firebaseapp.com",
  messagingSenderId: "401115753366",
  appId: "1:401115753366:web:19db6e47b3e5cb9a404bb7",
  measurementId: "G-NN0J5Z1TL8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const profileInput = document.getElementById("profilePicture");
  const previewImg = document.getElementById("preview");
  const uploadPicBtn = document.getElementById("uploadPicBtn");
  const saveBtn = document.getElementById("saveBtn");
  const deleteBtn = document.getElementById("deleteAccountBtn");
  const passwordModal = document.getElementById("passwordModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  let base64Image = "";

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const uid = user.uid;

    try {
      const picSnap = await get(ref(db, `users/${uid}/profilePicture`));
      if (picSnap.exists()) previewImg.src = picSnap.val();

      const resumeSnap = await get(ref(db, `users/${uid}/resume`));
      if (resumeSnap.exists()) {
        const data = resumeSnap.val();
        document.getElementById("name").value = data.fullName || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("skills").value = data.skills || "";
        document.getElementById("resumeURL").value = data.resumeURL || "";
      }

      const careerSnap = await get(ref(db, `users/${uid}/careerInfo`));
      if (careerSnap.exists()) {
        const data = careerSnap.val();
        document.getElementById("jobTitle").value = data.jobTitle || "";
        document.getElementById("company").value = data.company || "";
        document.getElementById("years").value = data.years || "";
        document.getElementById("major").value = data.major || "";
        document.getElementById("interests").value = data.interests || "";
        document.getElementById("jobType").value = data.jobType || "";
        document.getElementById("expDescription").value = data.expDescription || "";

        if (data.hasExperience === "yes") document.getElementById("expYes").checked = true;
        else if (data.hasExperience === "no") document.getElementById("expNo").checked = true;
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  });

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      passwordModal.style.display = "flex";  
    });
  }


  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      const email = document.getElementById("modalEmail").value;
      const password = document.getElementById("modalPassword").value;

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);

        
        await remove(ref(db, `users/${user.uid}`));

        
        await deleteUser(user);

        alert("Account deleted successfully.");
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Account deletion failed. Please check your credentials and try again.");
      } finally {
        passwordModal.style.display = "none";  
      }
    });
  }


  profileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      base64Image = event.target.result;
      previewImg.src = base64Image;
    };
    reader.readAsDataURL(file);
  });

  uploadPicBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user || !base64Image) return alert("No image selected or not logged in.");

    try {
      const picRef = ref(db, `users/${user.uid}/profilePicture`);
      await set(picRef, null);
      await set(picRef, base64Image);
      alert("Profile picture updated!");
    } catch (err) {
      console.error("Error saving profile picture:", err);
    }
  });

  saveBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("Not logged in.");

    const uid = user.uid;

    try {
      const resumeData = {
        fullName: document.getElementById("name")?.value || "",
        email: document.getElementById("email")?.value || "",
        skills: document.getElementById("skills")?.value || "",
        resumeURL: document.getElementById("resumeURL")?.value || "",
      };

      const careerData = {
        jobTitle: document.getElementById("jobTitle")?.value || "",
        company: document.getElementById("company")?.value || "",
        years: document.getElementById("years")?.value || "",
        major: document.getElementById("major")?.value || "",
        interests: document.getElementById("interests")?.value || "",
        jobType: document.getElementById("jobType")?.value || "",
        hasExperience: document.querySelector('input[name="hasExperience"]:checked')?.value || "no",
        expDescription: document.getElementById("expDescription")?.value || "",
      };

      await set(ref(db, `users/${uid}/resume`), resumeData);
      await set(ref(db, `users/${uid}/careerinfo`), careerData);
      alert("Account information updated successfully!");
    } catch (err) {
      console.error("Error saving form data:", err);
      alert("Error saving form data. See console for details.");
    }
  });
});