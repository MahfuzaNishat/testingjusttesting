import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5fhDLm0cV-q0L2oWxs6e0OwSU5gcggGI",
  authDomain: "test-bf20f.firebaseapp.com",
  databaseURL: "https://test-bf20f-default-rtdb.firebaseio.com",
  projectId: "test-bf20f",
  storageBucket: "test-bf20f.appspot.com",
  messagingSenderId: "401115753366",
  appId: "1:401115753366:web:19db6e47b3e5cb9a404bb7",
  measurementId: "G-NN0J5Z1TL8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const storiesContainer = document.getElementById("stories-container");
const careerFilter = document.getElementById("career-filter");
const filterBtn = document.getElementById("filter-btn");
const form = document.getElementById("story-form");

let user = null;

onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    user = currentUser;
    console.log("User is logged in:", user.email);

    try {
      const picSnap = await get(ref(database, `users/${user.uid}/profilePicture`));
      if (picSnap.exists()) {
        const profileImgEl = document.getElementById("userProfilePic");
        if (profileImgEl) profileImgEl.src = picSnap.val();
      }
    } catch (err) {
      console.error("Error fetching profile picture:", err);
    }

  } else {
    user = null;
    console.log("User is not logged in");
  }
});

filterBtn.addEventListener("click", () => {
  careerFilter.style.display = careerFilter.style.display === "none" ? "block" : "none";
});

function populateCareerFilterOptions(stories, selectedCareer) {
  const uniqueCareers = new Set(stories.map(story => story.career).filter(Boolean));

  const currentOptions = Array.from(careerFilter.options).map(opt => opt.value);
  const newOptions = ["", ...[...uniqueCareers].sort()];

  // Only repopulate if options changed
  if (currentOptions.join(",") !== newOptions.join(",")) {
    careerFilter.innerHTML = '<option value="">All</option>';
    uniqueCareers.forEach(career => {
      const option = document.createElement("option");
      option.value = career;
      option.textContent = career.charAt(0).toUpperCase() + career.slice(1);
      careerFilter.appendChild(option);
    });
  }

  if (selectedCareer && newOptions.includes(selectedCareer)) {
    careerFilter.value = selectedCareer;
  }
}

function loadStories() {
  const storiesRef = ref(database, "successStories");

  onValue(storiesRef, (snapshot) => {
    const data = snapshot.val();
    storiesContainer.innerHTML = "";

    if (!data) {
      storiesContainer.innerHTML = "<p>No stories available yet.</p>";
      return;
    }

    const stories = Object.values(data);
    const selectedCareer = careerFilter.value;

    populateCareerFilterOptions(stories, selectedCareer);

    const filtered = selectedCareer
      ? stories.filter(story => story.career === selectedCareer)
      : stories;

    filtered.sort(() => 0.5 - Math.random());

    filtered.forEach(({ name, career, story }) => {
      const card = document.createElement("div");
      card.className = "story-card";
      card.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Career:</strong> ${career}</p>
        <p>${story}</p>
      `;
      storiesContainer.appendChild(card);
    });
  });
}

careerFilter.addEventListener("change", loadStories);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!user) {
    alert("You must be logged in to submit a story.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const career = document.getElementById("career").value.trim();
  const story = document.getElementById("story").value.trim();

  if (!name || !career || !story) {
    alert("Please fill out all fields.");
    return;
  }

  const newStory = { name, career, story };
  const storiesRef = ref(database, "successStories");

  push(storiesRef, newStory)
    .then(() => {
      alert("Success story submitted!");
      form.reset();
      loadStories();
    })
    .catch((error) => {
      console.error("Error submitting story:", error);
      alert("Something went wrong. Try again.");
    });
});

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

loadStories();
