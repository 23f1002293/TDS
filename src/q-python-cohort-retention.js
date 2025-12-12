import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import { download } from "./download.js";

export default async function({ user, weight = 1.25 }) {
  const id = "q-python-cohort-retention";
  const title = "Python: Subscription Cohort Retention";

  const random = seedrandom(`${user.email}#${id}`);

  const signupMonths = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"];
  const firstCohort = signupMonths[0];

  const totalCustomers = 160 + Math.floor(random() * 50); // 160-209
  const monthOffsets = [0, 1, 2, 3, 4, 5];

  const rows = [["customer_id", "signup_month", "month_offset", "active_flag", "subscription_revenue_usd"]];

  const randomNormal = () => {
    const u1 = Math.max(random(), Number.EPSILON);
    const u2 = random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  const retentionCurve = {
    0: 0.99,
    1: 0.88,
    2: 0.76,
    3: 0.63,
    4: 0.56,
    5: 0.5,
  };

  const cohortCustomers = new Set();
  let retainedAtMonth3 = 0;

  for (let customerIndex = 1; customerIndex <= totalCustomers; customerIndex++) {
    const signupIndex = Math.floor(random() * signupMonths.length);
    const signupMonth = signupMonths[signupIndex];
    if (signupMonth === firstCohort) cohortCustomers.add(`C${String(customerIndex).padStart(4, "0")}`);

    // Base revenue per customer
    const baseRevenue = 85 + random() * 115;

    for (const offset of monthOffsets) {
      // Slight uplift for newer cohorts due to pricing
      const cohortFactor = 1 + signupIndex * 0.03;
      const decayNoise = randomNormal() * 0.08;

      const probability = Math.max(
        0.1,
        Math.min(0.98, (retentionCurve[offset] ?? 0.42) * cohortFactor + decayNoise * 0.04),
      );

      const isActive = random() < probability ? 1 : 0;
      const revenue = isActive ? Math.max(40, Math.round(baseRevenue * (1 + randomNormal() * 0.12) * 100) / 100) : 0;

      rows.push([`C${String(customerIndex).padStart(4, "0")}`, signupMonth, offset, isActive, revenue.toFixed(2)]);

      if (signupMonth === firstCohort && offset === 3 && isActive) retainedAtMonth3++;
    }
  }

  const retentionRate = retainedAtMonth3 / cohortCustomers.size;

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });

  const answer = async (response) => {
    if (!response) throw new Error("Enter the retention rate as decimal or percentage.");
    let value = parseFloat(response.replace(/[^\d.-]/g, ""));
    if (Number.isNaN(value)) throw new Error("Unable to parse the retention rate.");
    if (response.includes("%")) value /= 100;

    const tolerance = 0.005;
    if (Math.abs(value - retentionRate) > tolerance) {
      throw new Error(
        `Recalculate the cohort retention. You're off by more than about 0.5 percentage points—filter the ${firstCohort} cohort, month_offset 3, and divide active customers by the cohort size.`,
      );
    }
    return true;
  };

  const question = html`
    <div class="mb-3">
      <h2>StreamLuxe: Cohort Retention Health Check</h2>
      <p>
        StreamLuxe is a subscription OTT platform. Product leadership monitors retention curves to decide when to launch
        new loyalty features. They want a <strong>Pandas-based cohort analysis</strong> that replicates Excel cohort
        pivots but scales to millions of rows.
      </p>

      <h3>Dataset Schema</h3>
      <ul>
        <li><code>customer_id</code>: Unique subscriber</li>
        <li><code>signup_month</code>: YYYY-MM of first payment</li>
        <li><code>month_offset</code>: Months since signup (0–5)</li>
        <li><code>active_flag</code>: 1 if billed that month, 0 if churned</li>
        <li><code>subscription_revenue_usd</code>: Monthly revenue captured</li>
      </ul>

      <h3>Task</h3>
      <ol>
        <li>Load the CSV into Pandas.</li>
        <li>
          Create a pivot table (rows: <code>signup_month</code>, columns: <code>month_offset</code>) showing retention.
        </li>
        <li>
          Compute the <strong>Month 3 retention</strong> for the earliest cohort (${firstCohort}) as active customers ÷
          cohort size.
        </li>
        <li>Return the retention as a decimal (e.g., 0.64) or percentage (e.g., 64%).</li>
      </ol>

      <p>
        Download the cohort activity log:
        <button class="btn btn-sm btn-outline-primary" type="button" @click=${() => download(blob, `${id}.csv`)}>
          ${id}.csv
        </button>
      </p>

      <label for="${id}" class="form-label">
        What is the month 3 retention rate for the ${firstCohort} signup cohort?
      </label>
      <input class="form-control" id="${id}" name="${id}" placeholder="e.g. 0.62 or 62%" required />
      <p class="text-muted">
        Leverage <code>groupby</code> + <code>pivot_table</code> or a cohort matrix to compute this.
      </p>
    </div>
  `;

  return { id, title, weight, question, answer };
}

/* Recommended Python workflow (run with uv):

# /// script
# requires-python = ">=3.12"
# dependencies = ["pandas"]
# ///
import pandas as pd

df = pd.read_csv("q-python-cohort-retention.csv")
first_cohort = df["signup_month"].min()
cohort_size = df.loc[df["signup_month"] == first_cohort, "customer_id"].nunique()
month3_active = (
    df.query("signup_month == @first_cohort and month_offset == 3 and active_flag == 1")["customer_id"].nunique()
)
retention = month3_active / cohort_size
print(retention)

*/
