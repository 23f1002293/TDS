import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import { pick } from "./utils/random.js";

export default async function({ user, weight = 1 }) {
  const id = "q-hacker-news-search";
  const title = "Search Hacker News";

  const random = seedrandom(`${user.email}#${id}`);
  const topics = [
    "Python",
    "JavaScript",
    "Rust",
    "Go",
    "TypeScript",
    "WebAssembly",
    "Kubernetes",
    "Docker",
    "PostgreSQL",
    "SQLite",
    "GPT",
    "LLM",
    "AI",
    "Machine Learning",
    "OpenAI",
    "DeepSeek",
    "WebRTC",
    "Cloudflare",
    "AWS",
    "Linux",
    "Unix",
    "DuckDB",
    "Startup",
    "Funding",
    "Bootstrapping",
    "Indie Hackers",
    "SaaS",
    "Venture Capital",
    "Stripe",
    "Elon Musk",
    "Open Source",
    "Encryption",
    "VPN",
    "Signal",
    "Tor",
    "Privacy",
    "Cybersecurity",
    "Hacker",
    "Ransomware",
    "2FA",
    "Web Scraping",
    "Remote Work",
    "Productivity",
    "Quantum Computing",
    "Side Projects",
    "Text Editor",
    "Self-Hosting",
    "Minimalism",
    "Data Science",
    "Hacker Culture",
  ];
  const q = pick(topics, random);
  const points = Math.floor(random() * 70) + 30;
  let expected;

  const answer = async (link) => {
    link = link.trim();
    if (!expected) {
      const response = await fetch("/proxy/https://hnrss.org/newest?" + new URLSearchParams({ q, points }));
      if (!response.ok) throw new Error(`Failed to fetch Hacker News: ${response.status} ${response.statusText}`);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const first = doc.querySelector("item link");
      if (!first) throw new Error("No items found");
      expected = first.textContent;
    }
    if (link !== expected) throw new Error(`Incorrect link`);
    return true;
  };

  const question = html`
    <div class="mb-3">
      <h2>Media Intelligence for TechInsight Analytics</h2>
      <p>
        <strong>TechInsight Analytics</strong> is a leading market research firm specializing in technology trends and
        media intelligence. The company provides actionable insights to tech companies, startups, and investors by
        analyzing online discussions, news articles, and social media posts. One of their key data sources is
        <strong>Hacker News</strong>, a popular platform where tech enthusiasts and professionals share and discuss the
        latest in technology, startups, and innovation.
      </p>
      <p>
        In the rapidly evolving tech landscape, staying updated with the latest trends and public sentiments is crucial
        for TechInsight Analytics&#39; clients. Manual monitoring of Hacker News posts for specific topics and
        engagement levels is inefficient and error-prone due to the high volume of daily posts. To address this,
        TechInsight seeks to automate the process of identifying and extracting relevant Hacker News posts that mention
        specific technology topics and have garnered significant attention (measured by points).
      </p>
      <p>
        TechInsight Analytics has developed an internal tool that leverages the
        <a href="https://hnrss.github.io/">HNRSS API</a> to fetch the latest Hacker News posts. The tool needs to
        perform the following tasks:
      </p>
      <ol>
        <li>
          <strong>Topic Monitoring:</strong> Continuously monitor Hacker News for posts related to specific technology
          topics, such as &quot;Artificial Intelligence,&quot; &quot;Blockchain,&quot; or &quot;Cybersecurity.&quot;
        </li>
        <li>
          <strong>Engagement Filtering:</strong> Identify posts that have received a minimum number of points (votes) to
          ensure the content is highly engaging and relevant.
        </li>
        <li>
          <strong>Data Extraction:</strong> Extract essential details from the qualifying posts, including the
          post&#39;s link for further analysis and reporting.
        </li>
      </ol>
      <p>To achieve this, the team needs to create a program that:</p>
      <ul>
        <li>Searches Hacker News for the latest posts mentioning a specified topic.</li>
        <li>Filters these posts based on a minimum points threshold.</li>
        <li>Retrieves and returns the link to the most relevant post.</li>
      </ul>
      <h2>Your Task</h2>
      <p>
        Search using the <a href="https://hnrss.github.io/">Hacker News RSS API</a> for the latest Hacker News post
        mentioning <code>${q}</code> and having a minimum of <code>${points}</code> points. What is the link that it
        points to?
      </p>
      <ol>
        <li>
          <strong>Automate Data Retrieval:</strong> Utilize the HNRSS API to fetch the latest Hacker News posts. Use the
          URL relevant to fetching the latest posts, searching for topics and filtering by a minimum number of points.
        </li>
        <li>
          <strong>Extract and Present Data:</strong> Extract the most recent <code>&lt;item&gt;</code> from this result.
          Get the <code>&lt;link&gt;</code> tag inside it.
        </li>
        <li><strong>Share the result:</strong> Type in just the URL in the answer.</li>
      </ol>

      <label for="${id}" class="form-label">
        What is the link to the latest Hacker News post mentioning <code>${q}</code> having at least ${points} points?
      </label>
      <input class="form-control" id="${id}" name="${id}" type="url" required />
    </div>
  `;

  return { id, title, weight, question, answer };
}

/* Solution

# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "httpx",
# ]
# ///
import httpx
import xml.etree.ElementTree as ET


def fetch_hn_post(topic: str, min_points: int) -> str:
    params = {'q': topic, 'points': min_points}
    url = 'https://hnrss.org/newest'
    response = httpx.get(url, params=params)
    response.raise_for_status()
    root = ET.fromstring(response.text)
    item = root.find('.//item/link')
    return item.text


if __name__ == "__main__":
    import sys

    topic = sys.argv[1]
    min_points = int(sys.argv[2])

    url = fetch_hn_post(topic, min_points)
    print(f"Latest matching post: {url}")

*/
