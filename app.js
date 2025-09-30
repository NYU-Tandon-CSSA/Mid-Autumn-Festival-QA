// app.js
const $ = (id) => document.getElementById(id);

let state = {
  mode: null, // 'mc' or 'riddle'
  pool: [],
  currentIndex: 0,
  answers: [], // user answers
  results: [],
  manual: {}, // for riddle manual marking: idx -> true/false
};

function sample(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function start(mode) {
  state.mode = mode;
  state.currentIndex = 0;
  state.answers = [];
  state.results = [];
  state.manual = {};
  const pool = mode === "mc" ? window.MC_QUESTIONS : window.RIDDLES;
  state.pool = sample(pool, 7);
  $("q-total").textContent = state.pool.length;
  $("q-index").textContent = 1;
  $("quiz").classList.remove("hidden");
  $("result").classList.add("hidden");
  // reset live score display when a new game starts
  updateLiveScore();
  renderCurrent();
}

function renderCurrent() {
  const item = state.pool[state.currentIndex];
  $("q-index").textContent = state.currentIndex + 1;
  const body = $("q-body");
  body.innerHTML = "";
  const qEl = document.createElement("div");
  qEl.className = "question";
  qEl.innerHTML = `<div class="qtext">${item.q}</div>`;
  body.appendChild(qEl);
  if (state.mode === "mc") {
    const list = document.createElement("div");
    list.className = "options";
    // hide next until an answer is chosen
    $("next").style.display = "none";
    item.choices.forEach((choice) => {
      const opt = document.createElement("button");
      opt.className = "option";
      opt.textContent = choice;
      opt.addEventListener("click", () => {
        // record answer immediately
        state.answers[state.currentIndex] = choice;
        // mark selection UI
        Array.from(list.children).forEach((c) =>
          c.classList.remove("selected")
        );
        opt.classList.add("selected");

        // reveal correct answer and mark correctness
        Array.from(list.children).forEach((c) => {
          const val = c.textContent.trim();
          if (val === (item.a || "").toString().trim()) {
            c.classList.add("correct");
          } else if (val === choice) {
            c.classList.add("wrong");
          }
          // disable further clicks
          c.disabled = true;
        });

        // update live score
        updateLiveScore();

        // show next button
        $("next").style.display = "";
      });
      list.appendChild(opt);
    });
    body.appendChild(list);
    // show previous selection if exists (render as already-answered state)
    if (state.answers[state.currentIndex]) {
      Array.from(list.children).forEach((c) => {
        if (c.textContent === state.answers[state.currentIndex])
          c.classList.add("selected");
        // if already answered, show correct/wrong and disable
        const val = c.textContent.trim();
        if (val === (item.a || "").toString().trim())
          c.classList.add("correct");
        if (
          state.answers[state.currentIndex] &&
          val === state.answers[state.currentIndex] &&
          val !== (item.a || "").toString().trim()
        )
          c.classList.add("wrong");
        c.disabled = true;
      });
      $("next").style.display = "";
    }
  } else {
    // Riddle mode: staff-driven flow. Show a button to reveal answer, then staff marks correct/incorrect.
    // hide next button (we auto-advance after marking)
    $("next").style.display = "none";
    const revealWrap = document.createElement("div");
    revealWrap.className = "riddle-wrap";

    const showBtn = document.createElement("button");
    showBtn.className = "btn";
    showBtn.textContent = "显示答案";

    const answerDiv = document.createElement("div");
    answerDiv.className = "riddle-answer hidden";
    answerDiv.textContent = item.a || "";

    const markWrap = document.createElement("div");
    markWrap.className = "mark-wrap hidden";

    const correctBtn = document.createElement("button");
    correctBtn.className = "btn mark-btn";
    correctBtn.textContent = "正确";

    const wrongBtn = document.createElement("button");
    wrongBtn.className = "btn secondary mark-btn";
    wrongBtn.textContent = "错误";

    markWrap.appendChild(correctBtn);
    markWrap.appendChild(wrongBtn);

    showBtn.addEventListener("click", () => {
      answerDiv.classList.remove("hidden");
      markWrap.classList.remove("hidden");
      showBtn.disabled = true;
    });

    // staff marks correct
    correctBtn.addEventListener("click", () => {
      state.manual[state.currentIndex] = true;
      updateLiveScore();
      // small delay so staff can see the mark, then advance
      setTimeout(() => {
        goNext();
      }, 300);
    });

    wrongBtn.addEventListener("click", () => {
      state.manual[state.currentIndex] = false;
      updateLiveScore();
      setTimeout(() => {
        goNext();
      }, 300);
    });

    revealWrap.appendChild(showBtn);
    revealWrap.appendChild(answerDiv);
    revealWrap.appendChild(markWrap);
    body.appendChild(revealWrap);
  }
}

function updateLiveScore() {
  const pool = state.pool || [];
  let count = 0;
  pool.forEach((item, idx) => {
    if (state.mode === "riddle") {
      if (state.manual[idx]) count++;
    } else {
      const user = (state.answers[idx] || "").toString().trim();
      const correct = (item.a || "").toString().trim();
      if (user && user === correct) count++;
    }
  });
  const el = $("live-score");
  if (el) el.textContent = `已答对 ${count}`;
}

function goNext() {
  // if last, finish
  if (state.currentIndex === state.pool.length - 1) {
    finalize();
    return;
  }
  state.currentIndex++;
  renderCurrent();
}

function finalize() {
  // compute results
  state.results = state.pool.map((item, idx) => {
    const correct = (item.a || "").toString().trim();
    if (state.mode === "riddle") {
      // for riddles, show the correct answer as the displayed answer and use manual marks
      const user = correct;
      const ok = !!state.manual[idx];
      return { q: item.q, user, correct, ok };
    } else {
      const user = (state.answers[idx] || "").toString().trim();
      const ok = user === correct;
      return { q: item.q, user, correct, ok };
    }
  });

  const correctCount = state.results.filter((r) => r.ok).length;
  $(
    "score"
  ).textContent = `你答对了 ${correctCount} / ${state.pool.length} 道题`;
  const list = $("result-list");
  list.innerHTML = "";
  state.results.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="r-q">${r.q}</div>
      <div>你的答案：<strong>${
        r.user || "<未作答>"
      }</strong> · 正确答案：<strong>${r.correct}</strong> ${
      r.ok
        ? '<span style="color:#5fc679">(正确)</span>'
        : '<span style="color:#ee6c6a">(错误)</span>'
    }`;
    list.appendChild(li);
  });

  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");
}

// wire up buttons
window.addEventListener("DOMContentLoaded", () => {
  $("start-mc").addEventListener("click", () => start("mc"));
  $("start-riddle").addEventListener("click", () => start("riddle"));
  $("next").addEventListener("click", goNext);
  $("retry").addEventListener("click", () => start(state.mode));
  $("home").addEventListener("click", () => {
    $("quiz").classList.add("hidden");
    $("result").classList.add("hidden");
  });
});
