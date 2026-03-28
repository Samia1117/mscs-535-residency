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
        "message": "Secure demo running over HTTPS",
        "try_this": "/login?username=alice&password=Spring2026!"
    })

@app.route("/login", methods=["GET"])
def login():
    username = request.args.get("username", "")
    password = request.args.get("password", "")

    conn = get_db_connection()
    cur = conn.cursor()

    # SECURE: parameterized query prevents SQL injection
    query = """
    SELECT id, username, full_name, email, department
    FROM employees
    WHERE username = ? AND password = ?
    """
    print("Executing secure query with parameters")

    try:
        cur.execute(query, (username, password))
        row = cur.fetchone()
    except Exception:
        conn.close()
        return jsonify({"error": "Database access failed"}), 500

    conn.close()

    if row:
        return jsonify({
            "status": "login success",
            "employee": dict(row)
        }), 200

    return jsonify({
        "status": "login failed"
    }), 401

if __name__ == "__main__":
    context = ("server.crt", "server.key")
    app.run(host="0.0.0.0", port=5001, ssl_context=context, debug=True)
