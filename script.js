"use strict";

// Incolla qui l'URL completo di YouTube. Lascia la stringa vuota per nascondere il player.
const VIDEO_URL = "";
const LOCAL_VIDEO_URL = "assets/video/B1 Futuro semplice的变位.mp4";

const signs = [
  ["ARIETE", "♈", "La settimana sarà molto positiva e avrai più fiducia nel futuro e nell’amore e con il partner vivrete momenti di grande felicità."],
  ["TORO", "♉", "La settimana non è iniziata bene e probabilmente non finirà meglio, soprattutto nelle relazioni ci saranno difficoltà da superare. Se aspetti una risposta, arriverà entro l’autunno."],
  ["GEMELLI", "♊", "In questa settimana prenderai delle decisioni molto importanti. Ascolta i consigli delle persone che ti amano e tutto andrà bene."],
  ["CANCRO", "♋", "In questi giorni lavorerai molto, ma non stressarti troppo. Se hai richiesto un trasferimento, devi solo avere un po’ di pazienza."],
  ["LEONE", "♌", "Ti senti innamorato e nei prossimi giorni potrai esprimere le tue emozioni alla persona che ti piace."],
  ["VERGINE", "♍", "Riceverai una buona notizia che riguarda la famiglia. Se vuoi iniziare un nuovo percorso, fallo entro settembre."],
  ["BILANCIA", "♎", "Sentirai la necessità di cambiare qualcosa nella tua vita, ma non essere impaziente e non prendere decisioni affrettate."],
  ["SCORPIONE", "♏", "Un affare che ti ha impegnato molto sta per concludersi positivamente. Presto farai una scelta importante per il lavoro."],
  ["SAGITTARIO", "♐", "Una relazione che sembrava solo amicizia in realtà è qualcosa di più. Non perdere tempo e fai chiarezza."],
  ["CAPRICORNO", "♑", "Riuscirai a superare una situazione impegnativa, ma stai attento in amore perché ultimamente sei troppo distratto."],
  ["ACQUARIO", "♒", "Il lavoro ti darà grandi soddisfazioni e se sei single, presto conoscerai una persona interessante."],
  ["PESCI", "♓", "Spesso hai poca autostima: abbi più fiducia in te stesso e troverai molte persone che credono in te."]
];

const answerMap = new Map([
  ["vivrete", "vivere"], ["finirà", "finire"], ["saranno", "essere"], ["arriverà", "arrivare"],
  ["prenderai", "prendere"], ["andrà", "andare"], ["lavorerai", "lavorare"], ["potrai", "potere"],
  ["riceverai", "ricevere"], ["sentirai", "sentire"], ["farai", "fare"], ["riuscirai", "riuscire"],
  ["darà", "dare"], ["conoscerai", "conoscere"], ["troverai", "trovare"]
]);

const examples = new Map([["sarà", "essere"], ["avrai", "avere"]]);
let selected = new Set();
let inputValues = new Map();
let currentPart = 1;

const conjugations = [
  { parts: ["Domani Anna e Paolo ", " la Cappella Sistina."], blanks: [["visitare", "visiteranno"]] },
  { parts: ["Fra due settimane mia sorella ", " a trovarmi e ", " 10 giorni."], blanks: [["venire", "verrà"], ["rimanere", "rimarrà"]] },
  { parts: ["Giulia ", " molto elegante stasera."], blanks: [["essere", "sarà"]] },
  { parts: ["Chiamate il ristorante per avvertire che ", " in ritardo."], blanks: [["arrivare", "arriverete"]] },
  { parts: ["La prossima settimana ho un esame molto difficile: ", " a superarlo?"], blanks: [["riuscire", "riuscirò"]] },
  { parts: ["L’anno prossimo noi ", " un viaggio in India."], blanks: [["fare", "faremo"]] },
  { parts: ["Non riesco a trovare il gatto in casa. ", " in giardino."], blanks: [["Essere", "sarà"]] },
  { parts: ["Quando ", " il libro che ti ho regalato, ti ", " tantissimo."], blanks: [["leggere", "leggerai"], ["piacere", "piacerà"]] },
  { parts: ["Simone e Veronica non sono a scuola oggi. ", " la febbre."], blanks: [["Avere", "avranno"]] },
  { parts: ["A Milano ", " in albergo o prenderete un appartamento?"], blanks: [["stare", "starete"]] }
];

function normalize(value) { return value.trim().toLocaleLowerCase("it"); }
function withoutAccents(value) { return normalize(value).normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function renderHoroscope() {
  const grid = document.querySelector("#horoscope-grid");
  grid.innerHTML = "";
  let position = 0;
  signs.forEach(([name, symbol, text]) => {
    const article = document.createElement("article");
    article.className = "sign-card";
    const title = document.createElement("h3");
    title.innerHTML = `<span aria-hidden="true">${symbol}</span>${name}`;
    const paragraph = document.createElement("p");
    const tokens = text.match(/[\p{L}’]+|[^\p{L}’]+/gu) || [];
    tokens.forEach(token => {
      if (/^[\p{L}’]+$/u.test(token)) {
        const normalized = normalize(token);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "word";
        button.textContent = token;
        button.dataset.word = normalized;
        button.dataset.position = String(position++);
        if (examples.has(normalized)) {
          button.classList.add("example");
          button.disabled = true;
          button.setAttribute("aria-label", `${token}, esempio`);
        } else {
          button.setAttribute("aria-pressed", selected.has(button.dataset.position) ? "true" : "false");
          button.addEventListener("click", () => toggleWord(button));
        }
        paragraph.append(button);
      } else {
        paragraph.append(document.createTextNode(token));
      }
    });
    article.append(title, paragraph);
    grid.append(article);
  });
  updateWordClasses();
}

function toggleWord(button) {
  const id = button.dataset.position;
  document.querySelectorAll("#infinitive-rows input").forEach(input => inputValues.set(input.dataset.id, input.value));
  selected.has(id) ? selected.delete(id) : selected.add(id);
  document.querySelector("#parts-1-2-feedback").hidden = true;
  updateWordClasses();
  renderInfinitiveRows();
}

function updateWordClasses() {
  let correctCount = 0;
  document.querySelectorAll(".word:not(.example)").forEach(button => {
    const isSelected = selected.has(button.dataset.position);
    const isAnswer = answerMap.has(button.dataset.word);
    button.classList.remove("selected", "correct", "incorrect", "missed");
    button.classList.toggle("correct", isSelected && isAnswer);
    button.classList.toggle("incorrect", isSelected && !isAnswer);
    if (isSelected && isAnswer) correctCount++;
    button.setAttribute("aria-pressed", String(isSelected));
  });
  const progress = document.querySelector("#selection-progress");
  if (progress) {
    progress.textContent = correctCount === answerMap.size
      ? "15 个都找到了！"
      : `已找对 ${correctCount}/${answerMap.size} 个，还差 ${answerMap.size - correctCount} 个`;
    progress.classList.toggle("is-complete", correctCount === answerMap.size);
  }
}

function getSelectedButtons() {
  return [...document.querySelectorAll(".word:not(.example)")]
    .filter(button => selected.has(button.dataset.position))
    .sort((a, b) => Number(a.dataset.position) - Number(b.dataset.position));
}

function addExampleRow(tbody, word, infinitive) {
  const row = document.createElement("tr");
  row.innerHTML = `<td><strong>${word}</strong> <span class="example-tag">Esempio</span></td><td><strong>${infinitive}</strong></td>`;
  tbody.append(row);
}

function renderInfinitiveRows() {
  const tbody = document.querySelector("#infinitive-rows");
  tbody.innerHTML = "";
  addExampleRow(tbody, "sarà", "essere");
  addExampleRow(tbody, "avrai", "avere");
  getSelectedButtons().filter(button => answerMap.has(button.dataset.word)).forEach(button => {
    const id = button.dataset.position;
    const row = document.createElement("tr");
    row.dataset.id = id;
    const wordCell = document.createElement("td");
    wordCell.innerHTML = `<strong>${button.textContent}</strong>`;
    const answerCell = document.createElement("td");
    const input = document.createElement("input");
    input.className = "answer-input";
    input.type = "text";
    input.autocomplete = "off";
    input.autocapitalize = "none";
    input.spellcheck = false;
    input.dataset.id = id;
    input.setAttribute("aria-label", `Infinito di ${button.textContent}`);
    input.value = inputValues.get(id) || "";
    input.addEventListener("input", () => inputValues.set(id, input.value));
    input.addEventListener("keydown", preventEnterSubmit);
    answerCell.append(input);
    row.append(wordCell, answerCell);
    tbody.append(row);
  });
}

function checkPartsOneAndTwo() {
  let infinitivesCorrect = 0;
  const selectedCorrectCount = getSelectedButtons().filter(button => answerMap.has(button.dataset.word)).length;

  document.querySelectorAll("#infinitive-rows tr[data-id]").forEach(row => {
    const input = row.querySelector("input");
    const button = document.querySelector(`.word[data-position="${row.dataset.id}"]`);
    const correctAnswer = answerMap.get(button.dataset.word);
    row.querySelector(".row-correction")?.remove();
    input.classList.remove("is-correct", "is-wrong");
    if (correctAnswer && normalize(input.value) === correctAnswer) {
      input.classList.add("is-correct");
      infinitivesCorrect++;
    } else {
      input.classList.add("is-wrong");
      const correction = document.createElement("span");
      correction.className = "row-correction";
      correction.textContent = correctAnswer ? `Forma corretta: ${correctAnswer}` : "Questa parola non è al futuro semplice.";
      input.after(correction);
    }
  });

  const feedback = document.querySelector("#parts-1-2-feedback");
  feedback.innerHTML = selectedCorrectCount === 0
    ? `<p><strong>Torna alla Parte 1 e trova almeno un verbo.</strong></p>`
    : `<p><strong>Infiniti corretti: ${infinitivesCorrect}/${selectedCorrectCount}</strong></p><p>Correggi gli infiniti evidenziati e controlla di nuovo.</p>`;
  feedback.hidden = false;
}

function renderConjugations() {
  const list = document.querySelector("#conjugation-list");
  list.innerHTML = "";
  let blankIndex = 0;
  conjugations.forEach((item, questionIndex) => {
    const li = document.createElement("li");
    li.className = "exercise-item";
    const sentence = document.createElement("div");
    sentence.className = "sentence";
    item.parts.forEach((part, i) => {
      sentence.append(document.createTextNode(part));
      if (item.blanks[i]) {
        const [hint, answer] = item.blanks[i];
        const group = document.createElement("span");
        group.className = "blank-group";
        const hintNode = document.createElement("span");
        hintNode.className = "hint";
        hintNode.textContent = `(${hint})`;
        const input = document.createElement("input");
        input.className = "inline-input";
        input.type = "text";
        input.autocomplete = "off";
        input.autocapitalize = "none";
        input.spellcheck = false;
        input.dataset.answer = answer;
        input.dataset.blank = String(blankIndex++);
        input.setAttribute("aria-label", `Domanda ${questionIndex + 1}, verbo ${hint}`);
        input.addEventListener("keydown", preventEnterSubmit);
        group.append(hintNode, input);
        sentence.append(group);
      }
    });
    li.append(sentence);
    list.append(li);
  });
}

function checkConjugations() {
  let score = 0;
  document.querySelectorAll(".blank-correction").forEach(node => node.remove());
  document.querySelectorAll(".inline-input").forEach(input => {
    const answer = input.dataset.answer;
    const value = normalize(input.value);
    input.classList.remove("is-correct", "is-wrong");
    if (value === answer) {
      input.classList.add("is-correct");
      score++;
      return;
    }
    input.classList.add("is-wrong");
    const correction = document.createElement("span");
    correction.className = "blank-correction";
    correction.textContent = value && withoutAccents(value) === withoutAccents(answer)
      ? `Attenzione all’accento: ${answer}.`
      : `Forma corretta: ${answer}.`;
    input.closest(".blank-group").after(correction);
  });
  const feedback = document.querySelector("#conjugation-feedback");
  feedback.innerHTML = score === 12
    ? `<p><strong>${score}/12 · Bravissimo/a! Tutto corretto! 🎉</strong></p>`
    : `<p><strong>${score}/12</strong></p><p>Rileggi le forme corrette e prova di nuovo.</p>`;
  feedback.hidden = false;
}

function preventEnterSubmit(event) {
  if (event.key === "Enter") event.preventDefault();
}

function showPart(partNumber, behavior = "smooth") {
  currentPart = partNumber;
  document.querySelectorAll(".lesson-section").forEach((section, index) => {
    section.hidden = index + 1 !== partNumber;
  });
  document.querySelector("#step-progress").textContent = `Parte ${partNumber} di 5`;
  window.scrollTo({ top: 0, behavior });
  document.querySelector(`#parte-${partNumber} h2`)?.focus({ preventScroll: true });
}

function setupVideo() {
  const container = document.querySelector("#video-container");
  if (LOCAL_VIDEO_URL.trim()) {
    const video = document.createElement("video");
    video.src = LOCAL_VIDEO_URL;
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("aria-label", "Video sul futuro semplice");
    container.append(video);
    container.hidden = false;
    document.querySelector("#video-placeholder").hidden = true;
    return;
  }
  if (!VIDEO_URL.trim()) return;
  const idMatch = VIDEO_URL.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (!idMatch) return;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${idMatch[1]}`;
  iframe.title = "Video sul futuro semplice";
  iframe.loading = "lazy";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  container.append(iframe);
  container.hidden = false;
  document.querySelector("#video-placeholder").hidden = true;
}

function restart() {
  selected = new Set();
  inputValues = new Map();
  renderHoroscope();
  renderInfinitiveRows();
  renderConjugations();
  document.querySelectorAll(".feedback").forEach(node => { node.hidden = true; node.innerHTML = ""; });
  showPart(1);
}

renderHoroscope();
renderInfinitiveRows();
renderConjugations();
setupVideo();
document.querySelector("#check-selection").addEventListener("click", checkPartsOneAndTwo);
document.querySelector("#check-conjugation").addEventListener("click", checkConjugations);
document.querySelector("#restart").addEventListener("click", restart);
document.querySelectorAll(".next-button").forEach(button => {
  button.addEventListener("click", () => showPart(Number(button.dataset.next)));
});
document.querySelectorAll(".back-button").forEach(button => {
  button.addEventListener("click", () => showPart(Number(button.dataset.back)));
});
showPart(1, "auto");
