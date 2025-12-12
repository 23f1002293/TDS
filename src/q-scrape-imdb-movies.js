import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import { compareJSON } from "./utils/compare.js";

export default async function({ user, weight = 1 }) {
  const id = "q-scrape-imdb-movies";
  const title = "Scrape IMDb movies";

  const random = seedrandom(`${user.email}#${id}`);

  // Generate a minimum and maximum rating as a single-digit number between 2 and 9.
  // Ensure that ratings have a gap of at least 1
  let minRating = 0,
    maxRating = 0;
  while (maxRating - minRating < 1) {
    minRating = Math.floor(random() * 7) + 2;
    maxRating = Math.floor(random() * 7) + 2;
    if (minRating > maxRating) [maxRating, minRating] = [minRating, maxRating];
  }

  // Cache the HTML fetched
  let searchResults;
  const answer = async (json) => {
    if (!searchResults) {
      const response = await fetch(`/proxy/https://www.imdb.com/search/title/?user_rating=${minRating},${maxRating}`);
      if (response.ok) searchResults = await response.text();
      else {
        throw new Error(
          `I wasn't able to get the IMDb data to verify. Please try again. Response: ${response.status} ${response.statusText}`,
        );
      }
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(searchResults, "text/html");
    const titles = doc.querySelectorAll(".ipc-metadata-list-summary-item");
    const expected = [...titles].map((movie) => {
      const id = movie
        .querySelector(".ipc-title-link-wrapper")
        .getAttribute("href")
        .match(/(tt\d+)/)[1];
      const title = movie.querySelector(".ipc-title__text").textContent;
      // Year is the first metadata item
      const year = movie.querySelector(".dli-title-metadata-item").textContent;
      const rating = movie.querySelector(".ipc-rating-star--rating").textContent;
      return { id, title, year, rating };
    });
    // Check if the expected titles are in the JSON
    compareJSON(expected, JSON.parse(json), { verbose: true });
    return true;
  };

  const question = html`
    <div class="mb-3">
      <h2 id="-case-study-enhancing-content-curation-for-streamflix-streaming-service-">
        <strong>Content Curation for StreamFlix Streaming</strong>
      </h2>
      <p>
        <strong>StreamFlix</strong> is a rapidly growing streaming service aiming to provide a diverse and high-quality
        library of movies, TV shows, etc. to its subscribers. To maintain a competitive edge and ensure customer
        satisfaction, StreamFlix invests heavily in data-driven content curation. By analyzing movie ratings and other
        key metrics, the company seeks to identify films that align with subscriber preferences and emerging viewing
        trends.
      </p>
      <p>
        With millions of titles available on platforms like IMDb, manually sifting through titles to select suitable
        additions to StreamFlix&#39;s catalog is both time-consuming and inefficient. To streamline this process,
        StreamFlix&#39;s data analytics team requires an automated solution to extract and analyze movie data based on
        specific rating criteria.
      </p>
      <p>
        Develop a Python program that interacts with IMDb&#39;s dataset to extract detailed information about titles
        within a specified rating range. The extracted data should include the movie&#39;s unique ID, title, release
        year, and rating. This information will be used to inform content acquisition decisions, ensuring that
        StreamFlix consistently offers high-quality and well-received films to its audience.
      </p>
      <p>
        Imagine you are a data analyst at StreamFlix, responsible for expanding the platform&#39;s movie library. Your
        task is to identify titles that have received favorable ratings on IMDb, ensuring that the selected titles meet
        the company&#39;s quality standards and resonate with subscribers.
      </p>
      <p>To achieve this, you need to:</p>
      <ol>
        <li>
          <strong>Extract Data:</strong> Retrieve movie information from IMDb for all films that have a rating between
          <code>${minRating}</code> and <code>${maxRating}</code>.
        </li>
        <li>
          <strong>Format Data:</strong> Structure the extracted information into a JSON format containing the following
          fields:
          <ul>
            <li><code>id</code>: The unique identifier for the movie on IMDb.</li>
            <li><code>title</code>: The official title of the movie.</li>
            <li><code>year</code>: The year the movie was released.</li>
            <li><code>rating</code>: The IMDb user rating for the movie.</li>
          </ul>
        </li>
      </ol>
      <h2>Your Task</h2>
      <ol>
        <li>
          <strong>Source:</strong> Utilize IMDb&#39;s advanced web search at
          <a href="https://www.imdb.com/search/title/">https://www.imdb.com/search/title/</a> to access movie data.
        </li>
        <li><strong>Filter:</strong> Filter all titles with a rating between ${minRating} and ${maxRating}.</li>
        <li>
          <p>
            <strong>Format:</strong> For up to the first 25 titles, extract the necessary details: ID, title, year, and
            rating. The ID of the movie is the part of the URL after <code>tt</code> in the <code>href</code> attribute.
            For example, <a href="https://www.imdb.com/title/tt10078772/"><code>tt10078772</code></a
            >. Organize the data into a JSON structure as follows:
          </p>
          <pre><code class="json">[
  { "id": "tt1234567", "title": "Movie 1", "year": "2021", "rating": "5.8" },
  { "id": "tt7654321", "title": "Movie 2", "year": "2019", "rating": "6.2" },
  // ... more titles
]</code></pre>
        </li>
        <li><strong>Submit:</strong> Submit the JSON data in the text box below.</li>
      </ol>
      <h2>Impact</h2>
      <p>
        By completing this assignment, you&#39;ll simulate a key component of a streaming service&#39;s content
        acquisition strategy. Your work will enable StreamFlix to make informed decisions about which titles to license,
        ensuring that their catalog remains both diverse and aligned with subscriber preferences. This, in turn,
        contributes to improved customer satisfaction and retention, driving the company&#39;s growth and success in a
        competitive market.
      </p>
      <label for="${id}" class="form-label"> What is the JSON data? </label>
      <textarea class="form-control" id="${id}" name="${id}" rows="5" required></textarea>
      <p class="text-muted">
        IMDb search results may differ by region. You may need to manually translate titles. Results may also change
        periodically. You may need to re-run your scraper code.
      </p>
    </div>
  `;

  return { id, title, weight, question, answer };
}

/* Solution: Visit `https://www.imdb.com/search/title/?user_rating=${minRating},${maxRating}` and paste this code:

copy([...document.querySelectorAll(".ipc-metadata-list-summary-item")].map((movie) => {
      const id = movie
        .querySelector(".ipc-title-link-wrapper")
        .getAttribute("href")
        .match(/(tt\d+)/)[1];
      const title = movie.querySelector(".ipc-title__text").textContent;
      // Year is the first metadata item
      const year = movie.querySelector(".dli-title-metadata-item").textContent;
      const rating = movie.querySelector(".ipc-rating-star--rating").textContent;
      return { id, title, year, rating };
    }).slice(0, 25))

Note: What's displayed in the browser differs from what the proxy fetches.
That's why compareJSON is used with verbose mode.

*/
