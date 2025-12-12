import { html } from "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js";
import { default as seedrandom } from "seedrandom";
import { pick } from "./utils/random.js";

// Allow common CLI agent identifiers; substring match keeps grading flexible.
const allowedAgents = [
  "copilot",
  "github",
  "claude",
  "codex",
  "gemini",
  "cursor",
  "windsurf",
  "replit",
  "aider",
  "bolt",
];

const numbersIn = (text) => Array.from(String(text).matchAll(/-?\d+/g)).map((m) => m[0]);

const expectNumber = (target) => (output) => {
  if (!numbersIn(output).includes(String(target))) throw new Error(`Output must include ${target}`);
};

const expectSubstring = (snippet) => (output) => {
  if (!String(output).toLowerCase().includes(snippet.toLowerCase())) {
    throw new Error(`Output must include ${snippet}`);
  }
};

const randInt = (random, min, max) => Math.floor(random() * (max - min + 1)) + min;

const fibonacci = (n) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i += 1) {
    [a, b] = [b, a + b];
  }
  return a;
};

const factorial = (n) => {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
};

const sumSquares = (n) => (n * (n + 1) * (2 * n + 1)) / 6;

const trailingZeros = (n) => {
  let total = 0;
  for (let divisor = 5; divisor <= n; divisor *= 5) total += Math.floor(n / divisor);
  return total;
};

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
};

const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i += 1) if (n % i === 0) return false;
  return true;
};

const nthPrime = (n) => {
  let count = 0;
  let candidate = 1;
  while (count < n) {
    candidate += 1;
    if (isPrime(candidate)) count += 1;
  }
  return candidate;
};

const triangular = (n) => (n * (n + 1)) / 2;

const sumDigits = (n) =>
  String(n)
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);

const taskFactories = [
  (random) => {
    const n = randInt(random, 12, 24);
    return {
      id: `fib-${n}`,
      description:
        `Write and run a program that prints the ${n}th Fibonacci number (F0 = 0, F1 = 1). Return just the number.`,
      validate: expectNumber(String(fibonacci(n))),
      summary: `the ${n}th Fibonacci number`,
    };
  },
  (random) => {
    const n = randInt(random, 5, 10);
    return {
      id: `factorial-${n}`,
      description: `Write and run a program that prints ${n}! as a single integer.`,
      validate: expectNumber(String(factorial(n))),
      summary: `the factorial of ${n}`,
    };
  },
  (random) => {
    const n = randInt(random, 40, 120);
    return {
      id: `sum-squares-${n}`,
      description: `Write and run a program that prints the sum of the squares of the integers from 1 to ${n}.`,
      validate: expectNumber(String(sumSquares(n))),
      summary: `the sum of squares from 1 to ${n}`,
    };
  },
  (random) => {
    const n = randInt(random, 100, 250);
    return {
      id: `trailing-zeros-${n}`,
      description: `Write and run a program that prints the number of trailing zeros in ${n}!.`,
      validate: expectNumber(String(trailingZeros(n))),
      summary: `the trailing zero count of ${n}!`,
    };
  },
  (random) => {
    const a = randInt(random, 200, 600);
    const b = randInt(random, 200, 600);
    return {
      id: `gcd-${a}-${b}`,
      description: `Write and run a program that prints the greatest common divisor of ${a} and ${b}.`,
      validate: expectNumber(String(gcd(a, b))),
      summary: `gcd(${a}, ${b})`,
    };
  },
  (random) => {
    const a = randInt(random, 12, 30);
    const b = randInt(random, 12, 30);
    return {
      id: `lcm-${a}-${b}`,
      description: `Write and run a program that prints the least common multiple of ${a} and ${b}.`,
      validate: expectNumber(String(lcm(a, b))),
      summary: `lcm(${a}, ${b})`,
    };
  },
  (random) => {
    const value = randInt(random, 100, 500);
    return {
      id: `binary-${value}`,
      description: `Write and run a program that prints the binary representation of ${value} without any prefix.`,
      validate: expectSubstring(value.toString(2)),
      summary: `the binary form of ${value}`,
    };
  },
  (random) => {
    const n = randInt(random, 18, 40);
    return {
      id: `prime-${n}`,
      description: `Write and run a program that prints the ${n}th prime number.`,
      validate: expectNumber(String(nthPrime(n))),
      summary: `the ${n}th prime number`,
    };
  },
  (random) => {
    const n = randInt(random, 60, 150);
    return {
      id: `triangular-${n}`,
      description: `Write and run a program that prints the ${n}th triangular number (sum of 1 through ${n}).`,
      validate: expectNumber(String(triangular(n))),
      summary: `the triangular number T${n}`,
    };
  },
  (random) => {
    const value = randInt(random, 100000000, 999999999);
    return {
      id: `digit-sum-${value}`,
      description: `Write and run a program that prints the sum of the digits of ${value}.`,
      validate: expectNumber(String(sumDigits(value))),
      summary: `the digit sum of ${value}`,
    };
  },
];

const verifyAgent = (agent) => {
  const value = String(agent || "").toLowerCase();
  if (!value.trim()) throw new Error("Response must specify which coding agent was used");
  if (!allowedAgents.some((name) => value.includes(name))) {
    throw new Error("Agent field must mention a known CLI coding agent");
  }
};

const normalizeOutput = (output) => {
  const text = String(output || "").trim();
  if (!text) throw new Error("Response must include non-empty output");
  return text;
};

const buildTaskUrl = (url, query) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("q", query);
    return parsed.toString();
  } catch {
    const joiner = url.includes("?") ? (/[?&]$/.test(url) ? "" : "&") : "?";
    return `${url}${joiner}q=${encodeURIComponent(query)}`;
  }
};

export default async function({ user, weight = 2 }) {
  const id = "q-fastapi-coder";
  const title = "FastAPI + CLI Coding Agent";
  const random = seedrandom(`${user.email}#${id}`);
  const taskFactory = pick(taskFactories, random);
  const task = taskFactory(random);

  const question = html`
    <div class="mb-3">
      <h4>Case Study: Delegating Deep Work to CLI Coding Agents</h4>
      <p>
        <strong>Scenario:</strong> Your team experiments with CLI-based coding copilots (Copilot CLI, Codex CLI, Claude
        Code, Gemini CLI, Aider, Cursor CLI, etc.) to auto-solve well-scoped engineering chores. You must expose a
        public FastAPI endpoint that receives a task description and passes it to a coding agent that is allowed to
        create files, run code, and return the tool output safely.
      </p>
      <ol>
        <li>Implement a FastAPI app with a <code>GET /task?q=...</code> route.</li>
        <li>
          Inside the route, forward <code>q</code> to any CLI coding agent documented in
          <em>AI Coding CLI Playbook</em> and wait for the agent to finish the single task run (no human edits).
        </li>
        <li>
          Respond with JSON
          <code>{ "task": q, "agent": "copilot-cli", "output": "...", "email": "${user.email}" }</code>.
        </li>
        <li>Set CORS to allow cross-origin GET requests and keep logs of the agent run.</li>
      </ol>
      <p>
        For grading you'll receive this task:
        <code class="d-block my-2">${task.description}</code>
      </p>
      <label for="${id}" class="form-label">Enter the full URL of your <code>/task</code> endpoint</label>
      <input class="form-control" id="${id}" name="${id}" type="url" />
      <p class="text-muted">
        We'll GET <code>/task?q=...</code>, expect <code>application/json</code>, verify <code>agent</code>,
        <code>output</code>, and <code>email</code>, and confirm the output matches ${task.summary}.
      </p>
    </div>
  `;

  const answer = async (url) => {
    if (!url) throw new Error("URL is required");

    const target = buildTaskUrl(url, task.description);
    const resp = await fetch(target);
    if (!resp.ok) throw new Error("Endpoint did not return 200 OK");

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) throw new Error("Response must be JSON");

    let data;
    try {
      data = await resp.json();
    } catch {
      throw new Error("Response body is not valid JSON");
    }

    if (!data || typeof data !== "object") throw new Error("Response must be a JSON object");
    if (data.task && data.task !== task.description) throw new Error("Task echo does not match the requested prompt");
    if (data.email !== user.email) throw new Error("Email must match your registered email address");

    verifyAgent(data.agent);
    const output = normalizeOutput(data.output);
    task.validate(output);

    return true;
  };

  return { id, title, weight, question, answer };
}

/*
Python solution sketch: main.py

# /// script
# requires-python = ">=3.12"
# dependencies = ["fastapi", "uvicorn"]
# ///

import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

CLI = ["copilot", "task"]  # replace with the CLI agent available during grading

@app.get("/task")
async def run_task(q: str):
    try:
        proc = subprocess.run(CLI + [q], check=True, capture_output=True, text=True, timeout=180)
    except subprocess.CalledProcessError as exc:
        raise HTTPException(500, detail=exc.stderr) from exc
    return {"task": q, "agent": "copilot-cli", "output": proc.stdout.strip(), "email": "anand@study.iitm.ac.in"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
*/
