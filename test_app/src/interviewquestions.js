import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
const database = getDatabase(app);
const auth = getAuth(app);

const container = document.getElementById("questions-container");
const filter = document.getElementById("career-filter");
const filterBtn = document.getElementById("filter-btn");
const form = document.getElementById("question-form");

let user = null;

onAuthStateChanged(auth, async (currentUser) => {
  user = currentUser || null;

  if (user) {
    try {
      const picSnap = await get(ref(database, `users/${user.uid}/profilePicture`));
      if (picSnap.exists()) {
        const profileImgEl = document.getElementById("userProfilePic");
        if (profileImgEl) profileImgEl.src = picSnap.val();
      }
    } catch (err) {
      console.error("Error fetching profile picture:", err);
    }
  }
});

filterBtn.addEventListener("click", () => {
  filter.style.display = filter.style.display === "none" ? "block" : "none";
});

filter.addEventListener("change", loadQuestions);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!user) {
    alert("You must be logged in to submit a question.");
    return;
  }

  const career = document.getElementById("career").value.trim();
  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();

  if (!career || !question) {
    alert("Career and question are required.");
    return;
  }

  const newQuestion = { career, question };
  if (answer) newQuestion.answer = answer;

  const questionsRef = ref(database, "interviewQuestions");

  push(questionsRef, newQuestion)
    .then(() => {
      alert("Question submitted!");
      form.reset();
      loadQuestions();
    })
    .catch((err) => {
      console.error("Submit error:", err);
      alert("Something went wrong.");
    });
});

function loadQuestions() {
  const questionsRef = ref(database, "interviewQuestions");

  onValue(questionsRef, (snapshot) => {
    container.innerHTML = "";
    const data = snapshot.val();

    if (!data) {
      container.innerHTML = "<p>No questions available yet.</p>";
      return;
    }

    const questions = Object.values(data);
    const selected = filter.value;

    const careersSet = new Set(questions.map(q => q.career).filter(Boolean));
    filter.innerHTML = '<option value="">All Careers</option>';
    careersSet.forEach(career => {
      const option = document.createElement("option");
      option.value = career;
      option.textContent = career;
      filter.appendChild(option);
    });

    const filtered = selected
      ? questions.filter(q => q.career === selected)
      : questions;

    filtered.sort(() => 0.5 - Math.random());

    filtered.forEach(({ career, question, answer }) => {
      const div = document.createElement("div");
      div.className = "question-card";
      div.innerHTML = `
        <p><strong>Career:</strong> ${career}</p>
        <p><strong>Question:</strong> ${question}</p>
        ${answer ? `
          <textarea class="user-answer" placeholder="Your answer..."></textarea>
          <button class="reveal-answer">Reveal Author's Answer</button>
          <p class="author-answer" style="display:none;"><strong>Author's Answer:</strong> ${answer}</p>
        ` : "<p><em>No author answer provided.</em></p>"}
      `;
      container.appendChild(div);
    });
  });
}

container.addEventListener("click", (e) => {
  if (e.target.classList.contains("reveal-answer")) {
    const card = e.target.closest(".question-card");
    const answerEl = card.querySelector(".author-answer");
    if (answerEl) answerEl.style.display = "block";
    e.target.style.display = "none";
  }
});

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

loadQuestions();