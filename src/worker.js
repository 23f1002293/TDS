const headers = {
  "Content-Type": "application/json",
};

/**
 * Worker request handler for static assets, proxying, and server-side answer validation
 * @param {Request} request - HTTP request
 * @param {Object} env - Environment variables
 * @returns {Response} HTTP response
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      // GET /proxy/https://... proxies GET requests to external URLs
      if (url.pathname.startsWith("/proxy/")) {
        return await proxy(request);
      } // GET /exam-name serves exam-name.html for root path or valid exam IDs
      else if (/^\/[a-z0-9-]+$/.test(url.pathname)) {
        const requestProps = { method: request.method, headers: request.headers };
        return env.ASSETS.fetch(new Request(`${url.origin}/exam.html`, requestProps));
      } // Everything else is a static asset
      else {
        return env.ASSETS.fetch(request);
      }
    } else if (request.method === "POST") {
      // POST /proxy/https://... proxy POST requests to external URLs
      if (url.pathname.startsWith("/proxy/")) {
        return await proxy(request);
      } // POST /validate/{questionId} validates server-side answers
      else if (url.pathname.startsWith("/validate/")) {
        const questionId = url.pathname.split("/")[2];
        const { answer, user } = await request.json();

        if (!answerModules[questionId]) {
          return new Response(JSON.stringify({ error: "Unknown question" }), { status: 404, headers });
        }

        try {
          const answerFn = await answerModules[questionId].default(user);
          const isCorrect = await answerFn(answer);
          return new Response(JSON.stringify({ correct: isCorrect }), { headers });
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          return new Response(JSON.stringify({ correct: false, error }), { headers });
        }
      }
    }
    return new Response("Not found", { status: 404, headers });
  },
};

const proxy = async (request) => {
  const url = new URL(request.url);
  const targetUrl = url.pathname.slice(7) + url.search; // Remove '/proxy/'
  const headersList = filterHeaders(request.headers, safeRequestHeaders);
  headersList.set(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
  );
  const options = { method: request.method, headers: headersList, redirect: "follow" };
  if (request.method.match(/^(POST|PUT|PATCH)$/)) options.body = request.body;
  const response = await fetch(targetUrl, options);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: filterHeaders(response.headers, safeResponseHeaders),
  });
};

// Headers that are safe to forward to the target
const safeRequestHeaders = ["accept", "accept-language", "authorization", "content-type", "content-length", "range"];

// Headers that are safe to return from the response
const safeResponseHeaders = [
  "content-type",
  "content-length",
  "content-range",
  "content-disposition",
  "accept-ranges",
  "cache-control",
  "expires",
  "last-modified",
  "etag",
];

const filterHeaders = (headers, safeHeaders) => {
  const filtered = new Headers();
  safeHeaders.forEach((header) => {
    const value = headers.get(header);
    if (value) filtered.set(header, value);
  });
  return filtered;
};

// Map of server-side answer validation modules
const answerModules = {};
