import hljs from "https://cdn.jsdelivr.net/npm/highlight.js@11/+esm";
import { countdown, formatDateTime, formatTime } from "./utils/countdown.js";
import { formatScore } from "./utils/number.js";

const $body = document.body;
const $countdown = document.getElementById("countdown");
const $score = document.getElementById("score");
const $instructions = document.getElementById("instructions");
const $examForm = document.getElementById("exam-form");
const $loadingQuestions = document.getElementById("loading-questions");
const $questions = document.getElementById("questions");
const $sidebarQuestions = document.getElementById("sidebar-questions");
const $$check = document.querySelectorAll(".check-action");
let questions;
let endTime;

export async function setup(quiz) {
  // Check if the quiz is valid
  let response;
  try {
    response = await import(`./exam-${quiz}.info.js`);
  } catch {
    $examForm.innerHTML = /* html */ `
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error!</h4>
        <p>Sorry, we couldn't find the quiz ${quiz}. You might have the wrong link.</p>
        <hr>
        <p class="mb-0">Please contact the exam team for assistance.</p>
      </div>`;
    $examForm.classList.remove("d-none");
    return;
  }

  // Parse the quiz configuration, show instructions, and initialize the countdown
  const { title, start, end, instructions } = response.default;
  document.title = title;
  $instructions.innerHTML = instructions;

  // No authentication required for public example questions
  const user = { email: "anonymous" };

  // Start the countdown
  const startTime = new Date(typeof start == "function" ? start(user.email) : start);
  endTime = new Date(typeof end == "function" ? end(user.email) : end);
  countdown({ startTime, endTime, callback });

  // Show the questions directly (no time restrictions or permissions)
  await showQuestions(quiz, user);

  // Callback handles exam state changes and updates UI accordingly
  function callback({ status, time }) {
    $body.dataset.status = status;
    if (status == "pending") {
      $countdown.textContent = time < 24 * 60 * 60 * 1000
        ? `Starts in ${formatTime(time)}`
        : `Starts ${formatDateTime(startTime)}`;
    } else if (status == "ended") $countdown.textContent = `Ended at ${formatDateTime(endTime)}`;
    else if (status == "running") {
      $countdown.textContent = time < 24 * 60 * 60 * 1000
        ? `${formatTime(time)} left`
        : `Due ${formatDateTime(endTime)}`;
    }
    // Reload if the exam just started
    if (!questions) showQuestions(quiz, user);
  }
}

let isLoadingQuestions = false;

async function showQuestions(quiz, user) {
  if (!isLoadingQuestions) {
    isLoadingQuestions = true;
    const id = window.location.hash.slice(1);

    // Dynamically import questions and initialize them with user data
    $loadingQuestions.classList.remove("d-none");
    if (id) $loadingQuestions.scrollIntoView({ behavior: "smooth", block: "center" });
    $examForm.classList.remove("d-none");

    // Show the full list of questions on $questions and the question index on $sidebarQuestions
    const elementMap = new Map([
      [$questions, "questions"],
      [$sidebarQuestions, "index"],
    ]);

    questions = (await import(`./exam-${quiz}.js`)).questions;
    let results;
    try {
      results = await questions(user, elementMap);
    } catch (e) {
      $questions.innerHTML = /* html */ `<div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error!</h4>
        <p>Sorry, we couldn't load the questions. That's strange.</p>
        <pre>${e.message}

${e.stack}</pre>
        <hr>
        <p class="mb-0">Please contact the exam team for assistance.</p>
      </div>`;
      return;
    }
    $loadingQuestions.classList.add("d-none");
    hljs.highlightAll();

    // If the URL has a valid ID as #... then scroll to it. Else scroll to the top of the page
    if (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else $body.scrollIntoView();

    // Add validation feedback elements to all form inputs
    $examForm.querySelectorAll(".form-control").forEach((el) => {
      if (!el.parentNode.querySelector(".valid-feedback, .invalid-feedback")) {
        el.insertAdjacentHTML(
          "afterend",
          // Use .comment to hide from Mozilla-Readability, which I use to convert to Markdown via
          // https://tools.s-anand.net/page2md/
          /* html */ `<div class="valid-feedback mb-3 comment">Correct!</div>
            <div class="invalid-feedback mb-3 comment">Incorrect. Try again.</div>`,
        );
      }
    });

    // Show the check buttons
    [...$$check, $score].forEach((el) => el.classList.remove("d-none"));

    // Handle check-answer button clicks
    $examForm.addEventListener("click", (e) => {
      const $checkButton = e.target.closest(".check-answer");
      if ($checkButton) validateQuestion(e.target.dataset.question);
    });

    // Clicking on check button validates the answers
    const handleCheck = (e) => {
      e.preventDefault();
      validate();
    };
    [...$$check].forEach((el) => el.addEventListener("click", handleCheck));

    const scores = {};
    let total = 0;
    let max = 0;

    // Validate answers and return scores
    async function validate() {
      const answers = Object.fromEntries(new FormData($examForm));

      document.querySelectorAll(".check-action").forEach((el) => {
        el.disabled = true;
        el.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div>`;
      });

      // Show checking feedback for all questions
      for (const question of Object.keys(answers)) {
        $examForm.querySelector(`[data-question="${question}"] .invalid-feedback`).textContent = "Checking...";
        $examForm.querySelector(`[data-question="${question}"] .valid-feedback`).textContent = "Checking...";
      }

      // Evaluate each answer against expected results
      for (const question of Object.keys(answers)) await validateQuestion(question, answers);

      document.querySelectorAll(".check-action").forEach((el) => {
        el.disabled = false;
        el.innerHTML = "Check all";
      });

      return { answers, scores, total, max };
    }

    function updateScore() {
      total = Object.values(scores).reduce((a, b) => a + b, 0);
      max = Object.values(results).reduce((a, b) => a + b.weight, 0);
      $score.textContent = `Score: ${formatScore(total)} / ${formatScore(max)}`;
    }

    // Validate a single question
    async function validateQuestion(question, answers = null) {
      const $checkButton = $examForm.querySelector(`.check-answer[data-question="${question}"]`);
      $checkButton.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div>`;
      $checkButton.disabled = true;

      answers = answers ?? Object.fromEntries(new FormData($examForm));
      const answer = answers[question];
      const $q = $examForm.querySelector(`[data-question="${question}"]`);
      const $input = $examForm.querySelector(`[name="${question}"]`);

      $q.querySelector(".invalid-feedback").textContent = "Checking...";
      $q.querySelector(".valid-feedback").textContent = "Checking...";

      let expected = results[question].answer ?? null;
      let correct = false;
      let error = "Incorrect. Try again.";

      // Handle three types of answer validation:
      // 1. Function-based validation (async)
      if (typeof expected == "function") {
        try {
          correct = await expected(answer);
        } catch (e) {
          error = e;
        }
      } // 2. If the expected answer is null, any non-empty answer is correct
      else if (expected === null) {
        if (answer) correct = true;
      } // 3. Exact match validation
      else correct = answer === expected.toString();

      // Update the scores
      scores[question] = correct ? results[question].weight : 0;

      // Set the validity of the input
      $q.querySelector(".invalid-feedback").textContent = error;
      $q.querySelector(".valid-feedback").textContent = "Correct";
      $input.setCustomValidity(correct ? "" : "Incorrect answer");
      $q.classList.add("was-validated");
      $checkButton.innerHTML = "Check";
      $checkButton.disabled = false;

      updateScore();

      return correct;
    }
  }
}
