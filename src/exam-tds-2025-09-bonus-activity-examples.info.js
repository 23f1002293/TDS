export default {
  title: "TDS 2025 Sep Bonus Activity - Example Questions",
  start: "2025-09-01T00:00:00+05:30",
  end: () => "2025-12-31T23:59:59+05:30",
  allowed: () => true, // Allow all logged-in users to submit
  read: () => true, // Allow all to read (non-logged-in users in reader mode)
  admin: (email) =>
    email == "22f3001919@ds.study.iitm.ac.in" // Carlton D'Silva
    || email == "prasanna@study.iitm.ac.in" // PRASANNA S
    || email == "22f3002542@ds.study.iitm.ac.in" // JIVRAJ SINGH SHEKHAWAT
    || email == "22f3002460@ds.study.iitm.ac.in" // Hritik Roshan Maurya
    || email == "jkm@study.iitm.ac.in" // Jayakrishnan Warriem
    || email == "narayanan@study.iitm.ac.in" // Narayanan R
    || email == "sivaadithya@study.iitm.ac.in" // Sivaadithya M
    || email == "anand@study.iitm.ac.in", // Anand S
  instructions: /* html */ `
    <h1 class="display-3 my-5">
      TDS 2025 Sep Bonus Activity - Example Questions
    </h1>

    <h2 class="display-6 my-5">Overview</h2>
    <p>This is a curated collection of 8 example questions covering key tools and techniques from the Tools in Data Science course. These examples showcase the diversity of skills taught across all modules:</p>
    <ul>
      <li><strong>Data Wrangling</strong>: JSON filtering, Excel manipulation</li>
      <li><strong>Web Scraping</strong>: Data extraction from web sources</li>
      <li><strong>Data Preparation</strong>: Transforming and cleaning data</li>
      <li><strong>Analysis</strong>: Statistical analysis and cohort analysis</li>
      <li><strong>AI-Assisted Development</strong>: Using LLMs to write code</li>
      <li><strong>Visualization</strong>: Creating meaningful charts and plots</li>
    </ul>

    <h2 class="display-6 my-5">Bonus Activity Instructions</h2>
    <ol>
      <li><strong>Understand the examples</strong>. Study these 8 questions and their solutions to understand the patterns.</li>
      <li><strong>Create new questions</strong>. Following the same structure and difficulty level, create additional questions on Tools in Data Science topics not covered here.</li>
      <li><strong>Submit your questions</strong>. Add your new questions to this assignment by creating pull requests or contacting the instructors.</li>
      <li><strong>Validation</strong>. Your questions will be reviewed for clarity, correctness, and pedagogical value before being added to the main course material.</li>
    </ol>

    <h2 class="display-6 my-5">How to Use This Assignment</h2>
    <ol>
      <li><strong>Learn what you need</strong>. Reading material is provided, but feel free to skip it if you can answer the question.</li>
      <li><strong>Check your answers</strong> by pressing <kbd>Check</kbd>. It shows which answers are right or wrong. You can check multiple times.</li>
      <li><strong>Use anything</strong>. You can use any resources you want. The Internet, ChatGPT, friends, whatever.</li>
    </ol>

    <h2 class="display-6 my-5">Questions Included</h2>
    <ol>
      <li>Sort and Filter a JSON Product Catalog (Data Wrangling)</li>
      <li>Use Excel Spreadsheet Features (Spreadsheets)</li>
      <li>FastAPI Code Generation with LLM (AI-Assisted Development)</li>
      <li>Scrape IMDb Movie Data (Web Scraping)</li>
      <li>Search Hacker News with RSS Feed (Web Scraping - Proxy)</li>
      <li>JSON Sensor Data Rollup (Data Preparation)</li>
      <li>Python Cohort Retention Analysis (Statistical Analysis)</li>
      <li>Image Compression with Dynamic Quality (Image Processing)</li>
      <li>Region Containing Point Geospatial Query (Geospatial Analysis - Server-Side Validation)</li>
    </ol>
  `,
};
