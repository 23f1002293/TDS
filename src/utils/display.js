import { html, render } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";

export function displayQuestions(results, elementMap) {
  // Create an index linking to question headers (#hq-...) along with marks
  const index = html`<ol class="mt-3">
    ${
    results.map(({ id, title, weight }) => {
      return html`<li><a href="#h${id}">${title}</a> (${weight} ${weight == 1 ? "mark" : "marks"})</li>`;
    })
  }
  </ol>`;

  const questions = [
    // Heading
    html`<h1 class="display-6">Questions</h1>`,

    index,

    // Questions
    ...results.map(({ id, title, weight, question, help }, index) => {
      if (help && !Array.isArray(help)) help = [help];
      return html`
        <div class="card my-5" data-question="${id}" id="h${id}">
          <div class="card-header">
            <span class="badge text-bg-primary me-2">${index + 1}</span>
            ${title} (${weight} ${weight == 1 ? "mark" : "marks"})
          </div>
          ${help ? help.map((h) => html`<div class="card-body border-bottom">${h}</div>`) : ""}
          <div class="card-body">${question}</div>
          <div class="card-footer d-flex">
            <button type="button" class="btn btn-primary check-answer" data-question="${id}">Check</button>
          </div>
        </div>
      `;
    }),
  ];

  const structure = { index, questions };
  for (const [element, type] of elementMap) render(structure[type], element);
}
