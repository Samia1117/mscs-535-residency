# Web Security Vulnerabilities — Runnable Demos

## Prerequisites

You only need **Node.js** installed (no npm packages required).
Download it at https://nodejs.org if you don't have it.

Check with:
```
node --version
```

---

## Q1 — XSS (Cross-Site Scripting)

**File:** `q1-server.js`

```
node q1-server.js
```

Open http://localhost:3000 in your browser.

**What to try:**
1. Search for `hello` — works normally.
2. Search for `<b>bold</b>` — the HTML renders (it shouldn't).
3. Search for `<script>alert('XSS!')</script>` — the script executes.
4. Search for `<img src=x onerror="alert(document.cookie)">` — JS runs via an image tag.

**What to point out:** The user input goes straight into the HTML with no escaping. The browser has no way to tell the difference between the page's real HTML and the attacker's injected HTML.

Press `Ctrl+C` to stop the server.

---

## Q2 — eval() Exploitation

**File:** `q2-server.js`

```
node q2-server.js
```

Open http://localhost:3001 in your browser.

**What to try:**
1. Calculate `2 + 3 * 4` — works as expected (14).
2. Calculate `require('os').hostname()` — returns the server's hostname.
3. Calculate `require('fs').readdirSync('.').join(', ')` — lists files on the server.
4. Calculate `JSON.stringify(process.env)` — dumps all environment variables.
5. Calculate `process.exit(1)` — crashes the server entirely.

**What to point out:** eval() runs anything as JavaScript. The attacker isn't limited to math — they have full access to the Node.js runtime, the filesystem, and the network.

Press `Ctrl+C` to stop the server.

---

## Q3 — Mitigations (Fixed Versions)

**File:** `q3-server.js`

```
node q3-server.js
```

Open http://localhost:3002 in your browser.

**What to try — repeat the same attacks from Q1 and Q2:**

For the search (XSS fix):
1. Search for `<script>alert('XSS!')</script>` — it shows as plain text, no script runs.
2. Search for `<img src=x onerror="alert('hacked')">` — shows as plain text.

For the calculator (eval fix):
1. Calculate `2 + 3 * 4` — still works (14).
2. Calculate `require('os').hostname()` — rejected, only math allowed.
3. Calculate `process.exit(1)` — rejected.

**What to point out:**
- **XSS fix:** The `escapeHtml()` function converts `<` to `&lt;`, `>` to `&gt;`, etc. The browser renders them as visible characters, never as HTML tags.
- **eval() fix:** The `safeMathEval()` function uses a regex whitelist (`/^[\d\s+\-*/().%]+$/`) that only allows digits and math operators. Everything else is rejected before any evaluation happens.

---

## Running all three side by side

Open three terminal windows and run one in each:

```
# Terminal 1
node q1-server.js    # http://localhost:3000

# Terminal 2
node q2-server.js    # http://localhost:3001

# Terminal 3
node q3-server.js    # http://localhost:3002
```

This lets you demo the vulnerable and fixed versions at the same time.
