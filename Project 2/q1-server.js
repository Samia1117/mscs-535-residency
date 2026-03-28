// Q1: XSS — Code injection via web applications
// This server is INTENTIONALLY VULNERABLE for demonstration purposes.

const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/" || parsed.pathname === "/search") {
    const query = parsed.query.q || "";

    // Build the results section only if a search was submitted
    let resultsHtml = "";
    if (query) {
      // VULNERABLE: user input is inserted directly into HTML without escaping
      resultsHtml = `
        <hr style="margin: 24px 0;">
        <h2>Search Results</h2>
        <p>You searched for: ${query}</p>
        <p>No results found.</p>
      `;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto;">
        <h1>Q1 — XSS Vulnerability Demo</h1>
        <p>This page is <strong>intentionally vulnerable</strong> to reflected XSS.</p>

        <h3>Try these inputs:</h3>
        <ul>
          <li>Normal input: <code>hello world</code></li>
          <li>Bold injection: <code>&lt;b&gt;bold text&lt;/b&gt;</code></li>
          <li>Script injection: <code>&lt;script&gt;alert('XSS!')&lt;/script&gt;</code></li>
          <li>Image onerror: <code>&lt;img src=x onerror="alert('Cookie: '+document.cookie)"&gt;</code></li>
        </ul>

        <form action="/search" method="GET">
          <input type="text" name="q" placeholder="Search..." style="padding: 8px; width: 300px;">
          <button type="submit" style="padding: 8px 16px;">Search</button>
        </form>

        ${resultsHtml}
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Q1 - XSS Demo running at http://localhost:3000");
  console.log("Try searching: <script>alert('XSS!')</script>");
});
