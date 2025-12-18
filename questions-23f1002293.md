---
### Scenario 1: Real-time Agent Streaming with WebSockets

**Case Study:** Your team wants to see the CLI agent's output in real-time instead of waiting for the task to finish. You must upgrade the FastAPI service to support interactive, streaming communication.

*   **Implement a WebSocket endpoint** at `/ws/task`.
*   When a client connects, it sends a JSON message with the task description (e.g., `{"task": "..."}`).
*   The server should stream the agent's raw `stdout` and `stderr` back to the client in real-time.
*   Once the agent's process is finished, the server sends a final JSON message (e.g., `{"status": "completed", "exit_code": 0}`).
*   For grading, the task will be: **"Clone the public repository at `https://github.com/git/git.git` and run `git log -n 5 --oneline`."**

**Question:** Design the WebSocket communication protocol for this real-time agent. Specify the JSON message formats for both client-to-server and server-to-client communication, and describe how you would handle potential network interruptions and task cancellations from the client.

---
### Scenario 2: High-Throughput Batch Processing with a Task Queue

**Case Study:** The single-task endpoint is successful, and now the team needs to run hundreds of engineering chores in parallel. The API should not block and must handle high throughput.

*   **Implement a POST `/batch` endpoint** that accepts a JSON array of task descriptions.
*   This endpoint should immediately add the tasks to a message queue (e.g., RabbitMQ, Redis) and return a unique `batch_id`.
*   **Create a separate worker service** that consumes tasks from the queue, runs the CLI agent, and stores the results in a database (e.g., PostgreSQL, MongoDB) against the `batch_id`.
*   **Implement a GET `/batch/{batch_id}` endpoint** to check the status and retrieve the results of all tasks in a batch.
*   For grading, the batch task will be: **"Given a list of 10 different URLs, for each URL, download the HTML content and count the number of words in the `<body>` tag."**

**Question:** Architect the complete system, including the FastAPI endpoints, the worker process, the message queue, and the database schema. Justify your choice of a message queue and a database technology for this specific use case.

---
### Scenario 3: Secure Code Execution Sandbox

**Case Study:** The next evolution of the tool requires it to not just run shell commands, but to safely execute arbitrary code snippets submitted by users.

*   **Implement a POST `/execute` endpoint** that accepts a JSON body with a language and code (e.g., `{"language": "python", "code": "..."}`).
*   The system must execute the code within a secure, isolated sandbox (e.g., a Docker container) to prevent filesystem access, network calls, or other malicious actions.
*   The sandbox must have a defined set of pre-installed libraries (e.g., `pandas`, `scipy`).
*   The endpoint should return the `stdout`, `stderr`, and any execution errors as a JSON response.
*   For grading, the task will be to execute a Python snippet that uses `pandas` to create a DataFrame and calculate the mean of a column.

**Question:** Detail the design of a secure sandboxing system using Docker to handle the `/execute` endpoint. Explain how you would manage resource limits (CPU, memory, execution time) per execution and how you would build the Docker image to include the necessary libraries while restricting unsafe permissions.

---
---
# Multiple Choice Questions

### Question 4: API Gateway Latency Analysis

**Scenario:** You are given an API gateway access log where each line contains `timestamp`, `api_id`, `endpoint`, `response_time_ms`, and `http_status`. Your task is to find the average response time for a specific API (`api-123`) on a specific endpoint (`/users/{id}`), but only for successful `200` responses that took longer than 100ms.

**Task:** Given the following log entries, what is the average response time in milliseconds?
Submit your chosen answer (A, B, C, or D) to the endpoint `https://your-grading-system.com/submit/answer/1`.

```
2025-12-18T10:00:00Z,api-123,/users/{id},150,200
2025-12-18T10:01:00Z,api-123,/users/{id},250,200
2025-12-18T10:02:00Z,api-123,/users/{id},50,200
2025-12-18T10:03:00Z,api-456,/users/{id},300,200
2025-12-18T10:04:00Z,api-123,/users/{id},400,503
```

A) 150 ms
B) 200 ms
C) 216 ms
D) 250 ms

*(The correct answer is **B**. The average of the two valid entries (150 and 250) is 200.)*

---
### Question 5: Failed Authentication Spike

**Scenario:** A security log contains `timestamp` (ISO 8601 format) and `event_type` (`login_success` or `login_failure`). Your task is to identify the 10-minute interval with the highest number of failed logins.

**Task:** Given the log below, which 10-minute window (`HH:M0:00` to `HH:M9:59`) contains the most `login_failure` events?
Submit your chosen answer (A, B, C, or D) to the endpoint `https://your-grading-system.com/submit/answer/2`.

```
2025-12-18T10:01:00Z,login_failure
2025-12-18T10:08:00Z,login_failure
2025-12-18T10:11:00Z,login_failure
2025-12-18T10:12:00Z,login_failure
2025-12-18T10:19:00Z,login_failure
2025-12-18T10:21:00Z,login_failure
2025-12-18T10:22:00Z,login_success
```

A) 10:00 - 10:09
B) 10:10 - 10:19
C) 10:20 - 10:29
D) 10:30 - 10:39

*(The correct answer is **B**. The window 10:10-10:19 has three failures, while 10:00-10:09 has two and 10:20-10:29 has one.)*

---
### Question 6: Correlating Errors with Deployments

**Scenario:** You have two log files: `app-errors.log` (with `timestamp`, `error_code`) and `deployments.log` (with `timestamp`, `version_id`). Your task is to count how many critical errors occurred in the immediate aftermath of a specific deployment.

**Task:** A deployment for `version-v2` is logged in `deployments.log` at exactly `2025-12-18T14:00:00Z`. How many `error_code=500` events from `app-errors.log` occurred within the 5-minute window immediately following this deployment (from `14:00:00` up to, but not including, `14:05:00`)?
Submit your chosen answer (A, B, C, or D) to the endpoint `https://your-grading-system.com/submit/answer/3`.

*app-errors.log:*
```
2025-12-18T13:59:00Z,500
2025-12-18T14:00:00Z,500
2025-12-18T14:03:00Z,500
2025-12-18T14:04:30Z,404
2025-12-18T14:05:00Z,500
```

A) 1
B) 2
C) 3
D) 4

*(The correct answer is **B**. The errors at 14:00:00 and 14:03:00 fall within the window. The error at 14:05:00 is not within the window.)*
