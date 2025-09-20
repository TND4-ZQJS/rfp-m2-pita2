let currentQuestion = 1;
let questions = [];
let score = 0;
let quotes = [];

// 🔧 CHANGE THIS STRING when you switch to a different question set
const SET_KEY = 'ceilliset1_eng'; // ← Change to 'set2_' or 'set3_' etc. for other sets

// Load questions
fetch('ceilliset1_eng.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    loadProgress();
    displayQuestion(currentQuestion);
  });

// Load quotes
fetch('quotes.json')
  .then(res => res.json())
  .then(data => {
    quotes = data;
    showRandomQuote(); // Show first quote on page load
  });

function showRandomQuote() {
  if (!quotes.length) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteBox = document.getElementById('quote-box');
  if (quoteBox) {
    quoteBox.innerHTML = `<span class="quote-big">“</span><span class="quote-text">${quote}</span><span class="quote-big">”</span>`;
  }
}

function displayQuestion(num) {
  const q = questions[num - 1];
  if (!q) return;

  document.getElementById('question-number').innerHTML = `Question ${q.questionNumber}<span class="total-count"> of ${questions.length}</span>`;
  document.getElementById('question-text').innerText = q.question;

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  for (let key in q.options) {
    const btn = document.createElement('button');
    btn.textContent = `${key}. ${q.options[key]}`;
    btn.className = 'option';
    btn.disabled = false;

    const savedAnswer = localStorage.getItem(`${SET_KEY}answer_${num}`);
    if (savedAnswer) {
      btn.disabled = true;
      btn.classList.add('disabled');
      if (key === q.answer) btn.classList.add('correct');
      if (key === savedAnswer && savedAnswer !== q.answer) btn.classList.add('incorrect');
    }

    btn.onclick = () => checkAnswer(btn, key, q.answer);
    optionsContainer.appendChild(btn);
  }

  document.getElementById('feedback').innerText = '';
  updateScoreDisplay();
  localStorage.setItem(`${SET_KEY}last_question`, currentQuestion);
}

function checkAnswer(button, selected, correct) {
  const buttons = document.querySelectorAll('#options-container button');
  buttons.forEach(btn => {
    btn.classList.add('disabled');
    btn.disabled = true;
    if (btn.innerText.startsWith(`${correct}.`)) {
      btn.classList.add('correct');
    }
    if (btn.innerText.startsWith(`${selected}.`) && selected !== correct) {
      btn.classList.add('incorrect');
    }
  });

  document.getElementById('feedback').innerText = `Correct answer: ${correct}`;

  const previous = localStorage.getItem(`${SET_KEY}answer_${currentQuestion}`);
  if (!previous) {
    if (selected === correct) score++;
    localStorage.setItem(`${SET_KEY}score`, score);
  }

  localStorage.setItem(`${SET_KEY}answer_${currentQuestion}`, selected);
  updateScoreDisplay();
}

function nextQuestion() {
  if (currentQuestion < questions.length) {
    currentQuestion++;
    displayQuestion(currentQuestion);
    showRandomQuote(); // ⬅️ Change quote on Next
  }
}

function prevQuestion() {
  if (currentQuestion > 1) {
    currentQuestion--;
    displayQuestion(currentQuestion);
  }
}

function goToQuestion() {
  const num = parseInt(document.getElementById('jump-input').value);
  if (num >= 1 && num <= questions.length) {
    currentQuestion = num;
    displayQuestion(currentQuestion);
  } else {
    alert(`Please enter a valid question number (1–${questions.length})`);
  }
}

function updateScoreDisplay() {
  const totalAnswered = questions.filter((_, i) =>
    localStorage.getItem(`${SET_KEY}answer_${i + 1}`)
  ).length;
  document.getElementById('score-display').innerText = `Score: ${score} / ${totalAnswered}`;
}

function loadProgress() {
  const savedScore = localStorage.getItem(`${SET_KEY}score`);
  if (savedScore !== null) {
    score = parseInt(savedScore);
  }

  const lastSeen = localStorage.getItem(`${SET_KEY}last_question`);
  if (lastSeen) {
    currentQuestion = parseInt(lastSeen);
    showResumeBanner(currentQuestion);
  }
}

function resetProgress() {
  if (confirm('Are you sure you want to clear all your answers and restart?')) {
    for (let i = 1; i <= questions.length; i++) {
      localStorage.removeItem(`${SET_KEY}answer_${i}`);
    }
    localStorage.removeItem(`${SET_KEY}score`);
    localStorage.removeItem(`${SET_KEY}last_question`);
    score = 0;
    currentQuestion = 1;
    displayQuestion(currentQuestion);
  }
}

function showResumeBanner(savedQ) {
  const banner = document.getElementById('resume-banner');
  if (!banner) return;

  banner.style.display = 'block';
  banner.innerHTML = `
    Resumed from your last session at Question ${savedQ}.
    <span class="close-btn" onclick="dismissResumeBanner()">×</span>
  `;

  setTimeout(() => {
    banner.classList.add('fade-out');
    setTimeout(() => {
      banner.style.display = 'none';
      banner.classList.remove('fade-out');
    }, 500);
  }, 5000);
}

function dismissResumeBanner() {
  const banner = document.getElementById('resume-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}
