// DOM references 
const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");

const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const resultsSection = document.getElementById("results");

const wordTitle = document.getElementById("wordTitle");
const phoneticEl = document.getElementById("phonetic");
const partOfSpeechEl = document.getElementById("partOfSpeech");
const definitionEl = document.getElementById("definition");
const exampleEl = document.getElementById("example");
const synonymsEl = document.getElementById("synonyms");

const playAudioBtn = document.getElementById("playAudioBtn");
const audioEl = document.getElementById("audio");

// Helpers
function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.classList.remove("hidden");
}

function hideStatus() {
  statusEl.classList.add("hidden");
  statusEl.textContent = "";
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

function hideError() {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}

function showResults() {
  resultsSection.classList.remove("hidden");
}

function hideResults() {
  resultsSection.classList.add("hidden");
}

// Submit handler
form.addEventListener("submit", async (event) => {
  event.preventDefault(); //  stop page reload

  const word = input.value.trim();
  if (!word) {
    showError("Please enter a word.");
    hideStatus();
    hideResults();
    return;
  }

  hideError();
  showStatus("Loading...");
  hideResults();

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error("Word not found. Try another word.");

    const data = await res.json();
    displayResult(data);

    hideStatus();
    showResults();
  } catch (err) {
    hideStatus();
    hideResults();
    showError(err.message);
  }
});

function displayResult(data) {
  const wordData = data[0];

  // Word title
  wordTitle.textContent = wordData.word || "—";

  // Phonetic text (if available)
  phoneticEl.textContent =
    wordData.phonetic ||
    wordData.phonetics?.find(p => p.text)?.text ||
    "";

  // Meaning / definition / example
  const meaning = wordData.meanings?.[0];
  const defObj = meaning?.definitions?.[0];

  partOfSpeechEl.textContent = meaning?.partOfSpeech || "—";
  definitionEl.textContent = defObj?.definition || "—";
  exampleEl.textContent = defObj?.example || "No example available.";

  // Synonyms (from definition or meaning)
  const synonyms =
    defObj?.synonyms?.length ? defObj.synonyms :
    meaning?.synonyms?.length ? meaning.synonyms :
    [];

  synonymsEl.innerHTML = "";
  if (synonyms.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No synonyms found.";
    synonymsEl.appendChild(li);
  } else {
    synonyms.slice(0, 10).forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      synonymsEl.appendChild(li);
    });
  }

  // Audio (find first valid audio URL)
  const audioUrl = wordData.phonetics?.find(p => p.audio)?.audio;

  if (audioUrl) {
    audioEl.src = audioUrl;
    playAudioBtn.classList.remove("hidden");
    playAudioBtn.onclick = () => audioEl.play();
  } else {
    playAudioBtn.classList.add("hidden");
    audioEl.removeAttribute("src");
  }
}
