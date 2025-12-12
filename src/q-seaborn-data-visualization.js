import { en, Faker } from "https://cdn.jsdelivr.net/npm/@faker-js/faker@9/+esm";
import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";

export default async function({ user, weight = 1 }) {
  const id = "q-seaborn-data-visualization";
  const title = "Seaborn Data Visualization: Customer Behavior Analysis";

  const random = seedrandom(`${user.email}#${id}`);
  const faker = new Faker({ locale: [en], seed: Math.round(random() * 1000000) });

  // Generate customer behavior dataset
  const chartTypes = ["scatterplot", "lineplot", "barplot", "boxplot", "violinplot", "heatmap"];
  const selectedChart = chartTypes[Math.floor(random() * chartTypes.length)];

  // Generate business context based on chart type
  const businessContexts = {
    scatterplot: {
      title: "Customer Lifetime Value vs. Acquisition Cost Analysis",
      description:
        "analyze the relationship between customer acquisition cost and lifetime value to optimize marketing spend",
      x_var: "acquisition_cost",
      y_var: "lifetime_value",
      context: "marketing campaign effectiveness",
    },
    lineplot: {
      title: "Monthly Revenue Trend Analysis",
      description: "track monthly revenue trends across different customer segments to identify growth patterns",
      x_var: "month",
      y_var: "revenue",
      context: "seasonal revenue patterns",
    },
    barplot: {
      title: "Customer Satisfaction by Product Category",
      description: "compare average customer satisfaction scores across different product categories",
      x_var: "product_category",
      y_var: "satisfaction_score",
      context: "product performance insights",
    },
    boxplot: {
      title: "Purchase Amount Distribution by Customer Segment",
      description: "analyze the distribution of purchase amounts across different customer segments",
      x_var: "customer_segment",
      y_var: "purchase_amount",
      context: "customer spending behavior",
    },
    violinplot: {
      title: "Response Time Distribution by Support Channel",
      description:
        "visualize the distribution and density of customer support response times across different channels",
      x_var: "support_channel",
      y_var: "response_time",
      context: "support efficiency analysis",
    },
    heatmap: {
      title: "Customer Engagement Correlation Matrix",
      description:
        "create a correlation matrix heatmap showing relationships between different customer engagement metrics",
      x_var: "correlation_matrix",
      y_var: "engagement_metrics",
      context: "customer engagement patterns",
    },
  };

  const context = businessContexts[selectedChart];
  const companyName = faker.company
    .name()
    .replace(/[^a-zA-Z\s]/g, "")
    .trim();

  const answer = async (response) => {
    try {
      const url = new URL(response);
      if (!url.hostname.includes("raw.githubusercontent.com")) {
        throw new Error("URL should be from raw.githubusercontent.com");
      }

      // Check README.md for email
      const readmeResponse = await fetch(response);
      if (!readmeResponse.ok) {
        throw new Error("Could not fetch README.md from the provided URL");
      }

      const readmeText = await readmeResponse.text();
      if (!readmeText.includes(user.email)) {
        throw new Error("README.md does not contain your email address");
      }

      // Extract repo info to fetch other files
      const urlParts = response.split("/");
      const username = urlParts[3];
      const repo = urlParts[4];
      const branch = urlParts[5];
      const folderPath = urlParts.slice(6, -1).join("/");

      const baseUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${folderPath}`;

      // Check chart.py
      const pyResponse = await fetch(`${baseUrl}/chart.py`);
      if (!pyResponse.ok) {
        throw new Error("Could not fetch chart.py file");
      }

      const pyText = await pyResponse.text();

      // Validate Python script uses seaborn
      if (!pyText.toLowerCase().includes("seaborn") && !pyText.toLowerCase().includes("import sns")) {
        throw new Error("Python script must use seaborn library");
      }

      // Check for selected chart type in the script
      if (
        !pyText.toLowerCase().includes(selectedChart.toLowerCase())
        && !pyText.toLowerCase().includes(`sns.${selectedChart}`)
        && !pyText.toLowerCase().includes(`seaborn.${selectedChart}`)
      ) {
        throw new Error(`Python script must create a ${selectedChart} using seaborn`);
      }

      // Check chart.png exists and validate dimensions
      const imageResponse = await fetch(`${baseUrl}/chart.png`);
      if (!imageResponse.ok) {
        throw new Error("Could not fetch chart.png file");
      }

      const imageBlob = await imageResponse.blob();
      if (imageBlob.size === 0) {
        throw new Error("Chart image file is empty");
      }

      // Check image dimensions
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (width !== 512 || height !== 512) {
            reject(new Error("Chart image must be exactly 512x512 pixels"));
          } else {
            // Use OpenAI to validate if the image was generated by the Python script
            validateChartWithLLM(imageBlob, pyText, selectedChart, context).then(resolve).catch(reject);
          }
        };
        img.onerror = () => reject(new Error("Invalid image file"));
        img.src = URL.createObjectURL(imageBlob);
      });
    } catch (error) {
      throw new Error(`Repository validation failed: ${error.message}`);
    }
  };

  const validateChartWithLLM = async (imageBlob, pythonCode, chartType, context) => {
    if (!globalThis.aiPipeToken) {
      globalThis.aiPipeToken = prompt("Enter your AI Pipe Token for chart validation");
    }

    // Convert image to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch("https://aipipe.org/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${globalThis.aiPipeToken}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Look at this image and Python code. Does the image show a ${chartType} chart that could have been generated by this Python script using seaborn? The chart should be appropriate for ${context.context}. Answer only "Yes" or "No".\n\nPython code:\n${pythonCode}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim();

    if (content === "Yes") {
      return true;
    } else {
      throw new Error("Chart validation failed - image does not match the expected seaborn chart type");
    }
  };

  const question = html`
    <div class="mb-3">
      <h2>Customer Analytics: ${context.title}</h2>
      <p>
        <strong>${companyName}</strong> is a data-driven customer experience company that helps businesses understand
        and optimize their customer relationships through advanced analytics. They specialize in creating compelling
        data visualizations that transform raw customer data into actionable business insights for executive
        decision-making and strategic planning.
      </p>

      <h3>Business Context</h3>
      <p>
        A major retail client has approached ${companyName} to ${context.description}. The client needs a professional,
        publication-ready visualization that clearly communicates the insights to their executive team and board of
        directors. They specifically requested a Seaborn-based visualization due to its professional appearance and
        statistical rigor.
      </p>

      <p>
        This analysis is critical for the client's upcoming quarterly business review, where they need to present
        data-driven recommendations for ${context.context}. The visualization will be used in executive presentations,
        board reports, and strategic planning documents.
      </p>

      <h3>Your Task</h3>
      <p>
        Create a professional-grade Seaborn visualization following the techniques from the
        <em>Data Visualization with Seaborn</em> module. You need to generate a <strong>${selectedChart}</strong>
        that effectively communicates the business insights.
      </p>

      <h3>Requirements</h3>
      <ol>
        <li>
          <strong>Python Script:</strong> Create <code>chart.py</code> that uses Seaborn to generate the visualization
        </li>
        <li>
          <strong>Chart Type:</strong> Must be a <code>${selectedChart}</code> using
          <code>sns.${selectedChart}()</code> or equivalent
        </li>
        <li>
          <strong>Data Generation:</strong> Generate realistic synthetic data appropriate for the business context
        </li>
        <li><strong>Professional Styling:</strong> Apply appropriate Seaborn styling and customization</li>
        <li><strong>Export:</strong> Save as PNG with exactly 512x512 pixel dimensions</li>
        <li><strong>Repository:</strong> Create GitHub repository with required files</li>
      </ol>

      <h3>Python Script Guidelines</h3>
      <ul>
        <li>
          <strong>Import required libraries:</strong> <code>import seaborn as sns</code>,
          <code>import matplotlib.pyplot as plt</code>, <code>import pandas as pd</code>
        </li>
        <li><strong>Generate synthetic data:</strong> Create realistic data for ${context.context}</li>
        <li>
          <strong>Create ${selectedChart}:</strong> Use <code>sns.${selectedChart}()</code> with appropriate parameters
        </li>
        <li><strong>Style the chart:</strong> Set appropriate titles, labels, colors, and styling</li>
        <li><strong>Set figure size:</strong> Use <code>plt.figure(figsize=(8, 8))</code> for 512x512 output</li>
        <li><strong>Save chart:</strong> Use <code>plt.savefig('chart.png', dpi=64, bbox_inches='tight')</code></li>
      </ul>

      <h3>Seaborn Best Practices</h3>
      <ul>
        <li>Use <code>sns.set_style()</code> for professional appearance</li>
        <li>Apply appropriate color palettes with <code>palette</code> parameter</li>
        <li>Add meaningful titles and axis labels</li>
        <li>Consider using <code>sns.set_context()</code> for presentation-ready text sizes</li>
        <li>Ensure data is in proper format (use pandas DataFrame)</li>
      </ul>

      <h3>Repository Structure</h3>
      <p>Create a GitHub repository with a folder containing:</p>
      <ul>
        <li><code>README.md</code> - contains your email: ${user.email}</li>
        <li><code>chart.py</code> - Python script that generates the Seaborn chart</li>
        <li><code>chart.png</code> - Generated chart image (exactly 512x512 pixels)</li>
      </ul>

      <label for="${id}" class="form-label"> Enter the raw GitHub URL of your README.md file </label>
      <input
        class="form-control"
        id="${id}"
        name="${id}"
        required
        placeholder="https://raw.githubusercontent.com/[username]/[repo]/[branch]/[folder]/README.md"
      />
      <p class="text-muted">
        Your repository will be validated for: (1) README.md containing your email, (2) chart.py using seaborn to create
        a ${selectedChart}, (3) chart.png showing the generated visualization with exactly 512x512 pixel dimensions, and
        (4) verification that the chart matches the Python code.
      </p>
    </div>
  `;

  return { id, title, weight, question, answer };
}

/*
SOLUTION APPROACH:

1. PYTHON SCRIPT STRUCTURE (chart.py):
   ```python
   import seaborn as sns
   import matplotlib.pyplot as plt
   import pandas as pd
   import numpy as np

   # Set style for professional appearance
   sns.set_style("whitegrid")
   sns.set_context("paper", font_scale=1.2)

   # Generate synthetic data appropriate for business context
   # (varies by chart type - customer data, sales data, etc.)

   # Create the specified chart type
   plt.figure(figsize=(8, 8))
   sns.[charttype](data=df, x="x_var", y="y_var", ...)

   # Add professional styling
   plt.title("Professional Chart Title")
   plt.xlabel("X Axis Label")
   plt.ylabel("Y Axis Label")

   # Save with exact dimensions
   plt.savefig('chart.png', dpi=64, bbox_inches='tight')
   plt.show()
   ```

2. CHART TYPE VARIATIONS:
   - scatterplot: Customer acquisition cost vs lifetime value
   - lineplot: Time series trends (monthly revenue, growth)
   - barplot: Categorical comparisons (satisfaction by category)
   - boxplot: Distribution analysis (spending by segment)
   - violinplot: Distribution with density (response times)
   - heatmap: Correlation matrices (engagement metrics)

3. DATA GENERATION:
   - Use numpy/pandas to create realistic synthetic data
   - Ensure data relationships make business sense
   - Include appropriate noise and variance
   - Scale data to realistic business ranges

4. SEABORN STYLING:
   - Use professional color palettes (husl, Set2, viridis)
   - Apply appropriate context (paper, notebook, talk, poster)
   - Set proper font scales and sizes
   - Use clean, professional themes

5. VALIDATION PROCESS:
   - Verify Python script imports and uses seaborn
   - Check for correct chart type function call
   - Validate exact image dimensions (512x512)
   - Use LLM to confirm chart matches script and business context
   - Ensure professional quality appropriate for executive presentation

Key Learning: Seaborn provides powerful, statistically-oriented visualizations
that are ideal for business analytics and professional presentations.
*/
