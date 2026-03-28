from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_FILE = "company.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def home():
    return jsonify({
        "message": "Vulnerable demo running",
        "try_this": "/login?username=alice&password=Spring2026!",
        "sql_injection_demo": "/login?username=alice' --&password=anything"
    })

@app.route("/login", methods=["GET"])
def login():
    username = request.args.get("username", "")
    password = request.args.get("password", "")

    conn = get_db_connection()
    cur = conn.cursor()

    # INTENTIONALLY INSECURE: direct string concatenation
    query = f"SELECT id, username, full_name, email, department FROM employees WHERE username = '{username}' AND password = '{password}'"
    print("Executing vulnerable query:", query)

    try:
        cur.execute(query)
        row = cur.fetchone()
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e), "query": query}), 500

    conn.close()

    if row:
        return jsonify({
            "status": "login success",
            "employee": dict(row),
            "executed_query": query
        }), 200

    return jsonify({
        "status": "login failed",
        "executed_query": query
    }), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
