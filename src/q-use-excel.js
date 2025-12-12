import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as _ } from "https://cdn.jsdelivr.net/npm/lodash@4/+esm";
import { default as seedrandom } from "seedrandom";

export default async function({ user, weight = 1 }) {
  const id = "q-use-excel";
  const title = "Use Excel";

  const random = seedrandom(`${user.email}#${id}`);
  const sort = [10, 9, 13, 2, 11, 8, 16, 14, 7, 15, 5, 4, 6, 1, 3, 12];
  const seq = Array.from({ length: 16 }, () => Math.floor(random() * 16));
  const n = Math.floor(random() * 16) + 1;
  const indexedSeq = seq.map((value, index) => ({ value, index }));
  const sortedIndexedSeq = _.sortBy(indexedSeq, (item) => sort[item.index]);
  const sortedSeq = sortedIndexedSeq.map((item) => item.value).slice(0, n);
  const answer = _.sum(sortedSeq);

  const question = html`
    <div class="mb-3">
      <p>Let's make sure you can write formulas in Excel. Type this formula into Excel.</p>
      <p>Note: <strong>This will ONLY work in Office 365.</strong></p>

      <pre><code class="language-excel">=SUM(TAKE(SORTBY({${seq.join(",")}}, {${
    sort.join(
      ",",
    )
  }}), 1, ${n}))</code></pre>

      <label for="${id}" class="form-label">What is the result?</label>
      <input class="form-control" id="${id}" name="${id}" />
      <p class="text-muted">
        Note: If you get <code>#NAME?</code> you have the wrong version of Excel. Find a friend for whom this works.
      </p>
    </div>
  `;

  return { id, title, weight, question, answer };
}
