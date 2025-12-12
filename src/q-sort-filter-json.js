import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import seedrandom from "seedrandom";

export default async function({ user, weight = 1 }) {
  const id = "q-sort-filter-json";
  const title = "Sort and Filter a JSON Product Catalog";

  // deterministic RNG
  const random = seedrandom(`${user.email}#${id}`);
  const pick = (arr) => arr[Math.floor(random() * arr.length)];

  // sample data pools
  const categories = ["Electronics", "Apparel", "Books", "Home", "Toys"];
  const adjectives = ["Super", "Ultra", "Eco", "Smart", "Deluxe", "Mini", "Pro"];
  const nouns = ["Widget", "Gadget", "Device", "Kit", "Set", "Tool", "Item"];

  // generate 100 products with random category, price, and name
  const products = Array.from({ length: 100 }, () => ({
    category: pick(categories),
    price: Number((20 + random() * 180).toFixed(2)), // prices between 20.00 and 200.00
    name: `${pick(adjectives)} ${pick(nouns)}`,
  }));

  // filter out price < minPrice, then sort by category ↑, price ↓, name ↑
  const minPrice = Number((50 + random() * 100).toFixed(2)); // random price between 50.00 and 150.00
  const expected = products
    .filter((p) => p.price >= minPrice)
    .sort((a, b) => a.category.localeCompare(b.category) || b.price - a.price || a.name.localeCompare(b.name));

  const answer = (input) => {
    const arr = JSON.parse(input);
    if (arr.length !== expected.length) throw new Error("Array length mismatch");
    return arr.every(
      (p, i) => p.category === expected[i].category && p.price === expected[i].price && p.name === expected[i].name,
    );
  };

  const question = html`
    <div class="mb-3">
      <p>
        You’re auditing an e-commerce catalog. Below is a JSON array of
        <strong>100</strong> products. Each has a <code>category</code>, <code>price</code>, and <code>name</code>.
      </p>
      <ol>
        <li>Filter out any product with <code>price &lt; ${minPrice.toFixed(2)}</code>.</li>
        <li>
          Sort the remaining items by:
          <ul>
            <li><code>category</code> (A→Z)</li>
            <li>then <code>price</code> (highest→lowest)</li>
            <li>then <code>name</code> (A→Z)</li>
          </ul>
        </li>
        <li>Paste the final array as a single minified JSON string below.</li>
      </ol>
      <pre style="white-space: pre-wrap"><code class="language-json">
${JSON.stringify(products)}
      </code></pre>
      <label for="${id}" class="form-label"> Sorted &amp; filtered JSON: </label>
      <input class="form-control" id="${id}" name="${id}" />
    </div>
  `;

  return { id, title, weight, question, answer };
}
