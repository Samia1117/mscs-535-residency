// Q3: Mitigations — Fixed versions of Q1 (XSS) and Q2 (eval)
// This server demonstrates the SECURE approach.

const http = require("http");
const url = require("url");

// --- MITIGATION 1: HTML escaping function ---
// Converts dangerous characters to their HTML entity equivalents
// so the browser renders them as text, not as code.
function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

// --- MITIGATION 2: Safe math evaluator ---
// Only allows digits, operators, parentheses, dots, and spaces.
// Rejects anything that isn't a math expression.
function safeMathEval(expr) {
  // Whitelist: only math characters allowed
  if (!/^[\d\s+\-*/().%]+$/.test(expr)) {
    return { ok: false, error: "Rejected — only numbers and math operators are allowed" };
  }

  // Block empty or whitespace-only input
  if (expr.trim().length === 0) {
    return { ok: false, error: "Empty expression" };
  }

  try {
    // Even with sanitized input, we use Function() instead of eval()
    // because we've already guaranteed only math characters exist
    const result = new Function("return (" + expr + ")")();
    if (typeof result !== "number" || !isFinite(result)) {
      return { ok: false, error: "Result is not a valid number" };
    }
    return { ok: true, result: result };
  } catch (e) {
    return { ok: false, error: "Syntax error: " + e.message };
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/" || parsed.pathname === "/search" || parsed.pathname === "/calc") {
    const query = parsed.query.q || "";
    const expression = parsed.query.expr || "";

    // Build search results if a search was submitted
    let searchResultsHtml = "";
    if (query) {
      // FIXED: escapeHtml() neutralizes any HTML/script in the input
      const safeQuery = escapeHtml(query);
      searchResultsHtml = `
        <hr style="margin: 24px 0;">
        <h2>Search Results (SAFE)</h2>
        <p>You searched for: ${safeQuery}</p>
        <p style="color: green;">✓ Input was escaped — no script will execute.</p>
        <p>No results found.</p>
      `;
    }

    // Build calculator results if an expression was submitted
    let calcResultsHtml = "";
    if (expression) {
      // FIXED: safeMathEval() only allows math characters
      const result = safeMathEval(expression);
      const safeExpr = escapeHtml(expression);

      let resultLine;
      if (result.ok) {
        resultLine = `<p style="color: green;">✓ Result: <code>${result.result}</code></p>`;
      } else {
        resultLine = `<p style="color: red;">✗ ${escapeHtml(result.error)}</p>`;
      }

      calcResultsHtml = `
        <hr style="margin: 24px 0;">
        <h2>Calculator Result (SAFE)</h2>
        <p><strong>Expression:</strong> <code>${safeExpr}</code></p>
        ${resultLine}
      `;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: sans-serif; max-width: 700px; margin: 40px auto;">
        <h1>Q3 — Mitigated Server</h1>
        <p>Both vulnerabilities from Q1 and Q2 are <strong>fixed</strong> here.</p>

        <hr style="margin: 24px 0;">

        <h2>Fixed search (XSS mitigated)</h2>
        <p>User input is escaped before being inserted into HTML.</p>
        <p>Try the same XSS payloads — they will render as harmless text:</p>
        <ul>
          <li><code>&lt;script&gt;alert('XSS!')&lt;/script&gt;</code></li>
          <li><code>&lt;img src=x onerror="alert('hacked')"&gt;</code></li>
        </ul>
        <form action="/search" method="GET">
          <input type="text" name="q" placeholder="Search..." style="padding: 8px; width: 300px;">
          <button type="submit" style="padding: 8px 16px;">Search</button>
        </form>

        ${searchResultsHtml}

        <hr style="margin: 24px 0;">

        <h2>Fixed calculator (eval mitigated)</h2>
        <p>Input is validated against a strict whitelist. Only math is allowed.</p>
        <p>Try the same dangerous inputs — they will be rejected:</p>
        <ul>
          <li>Allowed: <code>2 + 3 * 4</code>, <code>(10 - 2) / 4</code></li>
          <li>Blocked: <code>process.exit(1)</code></li>
          <li>Blocked: <code>require('fs').readdirSync('.')</code></li>
        </ul>
        <form action="/calc" method="GET">
          <input type="text" name="expr" placeholder="Enter expression..." style="padding: 8px; width: 300px;">
          <button type="submit" style="padding: 8px 16px;">Calculate</button>
        </form>

        ${calcResultsHtml}
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3002, () => {
  console.log("Q3 - Mitigated Demo running at http://localhost:3002");
  console.log("Try the same attacks from Q1 and Q2 — they are now blocked.");
});
