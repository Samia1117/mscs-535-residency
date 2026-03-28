# Project 2 — Web Security Vulnerabilities: Code Injection and Dynamic Evaluation

## Overview

This project demonstrates two critical web application vulnerabilities — Cross-Site Scripting (XSS) and unsafe dynamic code evaluation via `eval()` — along with their mitigations. Each vulnerability is implemented as a standalone Node.js web server for hands-on demonstration.

---

## Q1 — Cross-Site Scripting (XSS): Code Injection via Web Applications

### What is XSS?

Cross-Site Scripting (XSS) is a vulnerability where an attacker injects malicious scripts into web pages viewed by other users. In a reflected XSS attack, user input is included directly in the server's HTML response without sanitization. The browser cannot distinguish between the page's legitimate HTML and the attacker's injected code, so it executes everything.

### Vulnerable Code

The server takes user input from a search form and inserts it directly into the HTML response:

```js
const query = parsed.query.q || "";

// VULNERABLE: user input is inserted directly into HTML without escaping
resultsHtml = `
  <h2>Search Results</h2>
  <p>You searched for: ${query}</p>
`;
```

The variable `${query}` contains whatever the user typed, and it is placed into the HTML with no filtering or escaping.

### Demonstration

**Normal input — `hello world`:**

When a user searches for plain text like `hello world`, the page behaves as expected. The input is displayed back as text, and no malicious behavior occurs. This establishes a baseline showing the search feature works normally.

*(Screenshot: Search results page showing "You searched for: hello world")*

**HTML injection — `<b>bold text</b>`:**

When a user enters HTML tags such as `<b>bold text</b>`, the browser interprets them as real HTML. Instead of displaying the raw text `<b>bold text</b>`, the page renders **bold text**. This proves the server is not distinguishing between user input and page markup.

*(Screenshot: Search results page showing "bold text" rendered in bold)*

**Script injection — `<script>alert('XSS!')</script>`:**

When a user enters a script tag, the browser executes the JavaScript. An alert dialog appears, proving that arbitrary code can run in the context of the page. In a real attack, this could steal cookies, redirect users, or modify page content.

*(Screenshot: Browser alert dialog showing "XSS!")*

**Image onerror — `<img src=x onerror="alert('Cookie: '+document.cookie)">`:**

This payload uses an image tag with an invalid source. When the image fails to load, the `onerror` event fires and executes JavaScript. This demonstrates that XSS is not limited to `<script>` tags — many HTML elements can trigger code execution.

*(Screenshot: Browser alert dialog showing cookie information)*

### Why This Is Dangerous

- An attacker can craft a URL containing the malicious payload and send it to a victim
- When the victim clicks the link, the script executes in their browser session
- The attacker can steal session cookies, redirect to phishing pages, or modify what the user sees
- The attack runs with the same permissions as the legitimate website

---

## Q2 — Dynamic Evaluation of Code via `eval()`

### What is Dynamic Code Evaluation?

Dynamic code evaluation means executing code that is constructed or received at runtime rather than code that was written at compile time. In JavaScript, `eval()` takes a string and runs it as live code. When user input is passed to `eval()`, the attacker can execute arbitrary code on the server.

### Vulnerable Code

The server takes a user-provided expression and passes it directly to `eval()`:

```js
const expression = parsed.query.expr || "";

let result;
try {
  // VULNERABLE: eval() executes any JavaScript the user sends
  result = eval(expression);
} catch (e) {
  result = "Error: " + e.message;
}
```

There is no validation or restriction on what the expression can contain. Any valid JavaScript will execute on the server.

### Demonstration

**Normal math — `2 + 3 * 4`:**

When a user enters a math expression, `eval()` computes it and returns the result (14). This is the intended use case and demonstrates the calculator working normally.

*(Screenshot: Calculator showing Expression: 2 + 3 * 4, Result: 14)*

**Reading the hostname — `require('os').hostname()`:**

The attacker can import Node.js modules and call system functions. This returns the server's hostname, revealing information about the infrastructure.

*(Screenshot: Calculator showing the server's hostname)*

**Reading files — `require('fs').readdirSync('.').join(', ')`:**

The attacker can read the server's filesystem. This lists all files in the current directory, potentially exposing source code, configuration files, and credentials.

*(Screenshot: Calculator showing a list of files on the server)*

**Reading environment variables — `JSON.stringify(process.env)`:**

Environment variables often contain database passwords, API keys, and other secrets. The attacker can dump all of them with a single expression.

*(Screenshot: Calculator showing environment variables)*

**Crashing the server — `process.exit(1)`:**

The attacker can terminate the server process entirely, causing a denial of service for all users.

*(Screenshot: Server terminal showing the process has exited)*

### Why This Is Dangerous

- The attacker has full access to the Node.js runtime with the same privileges as the server process
- They can read and write files, access databases, make network requests, and install backdoors
- They can exfiltrate sensitive data such as environment variables, credentials, and source code
- They can crash or take complete control of the server

---

## Q3 — Mitigations

### XSS Mitigation: HTML Escaping

The fix converts dangerous characters to their HTML entity equivalents before inserting user input into the page:

```js
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

// Usage: input is escaped before being placed in HTML
const safeQuery = escapeHtml(query);
resultsHtml = `<p>You searched for: ${safeQuery}</p>`;
```

**How it works:** When a user types `<script>alert('XSS!')</script>`, the `escapeHtml()` function converts it to `&lt;script&gt;alert(&#39;XSS!&#39;)&lt;/script&gt;`. The browser renders this as visible text rather than executing it as code. The `<` and `>` characters are no longer treated as HTML tag delimiters.

**Demonstration:**

When the same XSS payloads from Q1 are entered into the mitigated search form, they appear as plain text on the page. No scripts execute, no HTML renders — the input is displayed exactly as the user typed it.

*(Screenshot: Mitigated search page showing `<script>alert('XSS!')</script>` rendered as plain text with green checkmark)*

### eval() Mitigation: Input Whitelist and Safe Evaluation

The fix uses a two-layer defense:

```js
function safeMathEval(expr) {
  // Layer 1: Whitelist — only math characters allowed
  if (!/^[\d\s+\-*/().%]+$/.test(expr)) {
    return { ok: false, error: "Rejected — only numbers and math operators are allowed" };
  }

  // Layer 2: Use Function() instead of eval() for scope isolation
  const result = new Function("return (" + expr + ")")();

  // Layer 3: Validate the result is a finite number
  if (typeof result !== "number" || !isFinite(result)) {
    return { ok: false, error: "Result is not a valid number" };
  }
  return { ok: true, result: result };
}
```

**How it works:**

1. **Input whitelist:** A regular expression `/^[\d\s+\-*/().%]+$/` checks that the input contains only digits (`0-9`), math operators (`+ - * / %`), parentheses, decimal points, and spaces. Any input containing letters, semicolons, quotes, or other characters is immediately rejected. This blocks all dangerous inputs like `require(...)`, `process.exit()`, and `JSON.stringify(...)` because they contain letters.

2. **Scope isolation:** Even after validation, `new Function()` is used instead of `eval()`. Unlike `eval()`, `new Function()` runs in its own scope and cannot access local variables.

3. **Result validation:** The output is verified to be a finite number, rejecting `NaN` or `Infinity`.

**Demonstration:**

- `2 + 3 * 4` — still works correctly, returns 14 with a green checkmark
- `process.exit(1)` — rejected with a red error: "only numbers and math operators are allowed"
- `require('fs').readdirSync('.')` — rejected with a red error: "only numbers and math operators are allowed"

*(Screenshot: Mitigated calculator rejecting `process.exit(1)` with red error message)*
*(Screenshot: Mitigated calculator successfully computing `2 + 3 * 4` with green checkmark)*

---

## How to Run

Ensure Node.js is installed (`node --version`).

```bash
# Terminal 1 — Vulnerable XSS demo
node q1-server.js    # http://localhost:3000

# Terminal 2 — Vulnerable eval() demo
node q2-server.js    # http://localhost:3001

# Terminal 3 — Mitigated versions of both
node q3-server.js    # http://localhost:3002
```

---

## Summary

| Vulnerability | Attack | Root Cause | Mitigation |
|---|---|---|---|
| XSS (Q1) | Inject `<script>` tags via search input | User input inserted into HTML without escaping | `escapeHtml()` converts `<`, `>`, `&`, `"`, `'` to HTML entities |
| eval() (Q2) | Pass arbitrary JS to the calculator | `eval()` executes any string as code | Regex whitelist allows only math characters; `new Function()` for scope isolation |
