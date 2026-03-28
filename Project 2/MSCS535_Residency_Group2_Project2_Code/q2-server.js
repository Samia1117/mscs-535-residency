// Q2: eval() — Dynamic evaluation of code at runtime
// This server is INTENTIONALLY VULNERABLE for demonstration purposes.

const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/" || parsed.pathname === "/calc") {
    const expression = parsed.query.expr || "";

    // Build the results section only if an expression was submitted
    let resultsHtml = "";
    if (expression) {
      let result;
      try {
        // VULNERABLE: eval() executes any JavaScript the user sends
        result = eval(expression);
      } catch (e) {
        result = "Error: " + e.message;
      }

      resultsHtml = `
        <hr style="margin: 24px 0;">
        <h2>Calculator Result</h2>
        <p><strong>Expression:</strong> <code>${String(expression).replace(/</g, '&lt;')}</code></p>
        <p><strong>Result:</strong> <code>${String(result).replace(/</g, '&lt;')}</code></p>
      `;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto;">
        <h1>Q2 — eval() Vulnerability Demo</h1>
        <p>This "calculator" uses <code>eval()</code> to process expressions.</p>
        <p>It is <strong>intentionally vulnerable</strong>.</p>

        <h3>Try these inputs:</h3>
        <ul>
          <li>Normal math: <code>2 + 3 * 4</code></li>
          <li>Read environment: <code>JSON.stringify(process.env)</code></li>
          <li>Read files: <code>require('fs').readdirSync('.').join(', ')</code></li>
          <li>Get hostname: <code>require('os').hostname()</code></li>
          <li>Crash server: <code>process.exit(1)</code> (will kill the server!)</li>
        </ul>

        <form action="/calc" method="GET">
          <input type="text" name="expr" placeholder="Enter expression..." style="padding: 8px; width: 300px;">
          <button type="submit" style="padding: 8px 16px;">Calculate</button>
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

server.listen(3001, () => {
  console.log("Q2 - eval() Demo running at http://localhost:3001");
  console.log('Try calculating: require("os").hostname()');
});
