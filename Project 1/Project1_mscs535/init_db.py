import sqlite3

DB_FILE = "company.db"

def main():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        department TEXT NOT NULL
    )
    """)

    cur.execute("DELETE FROM employees")

    sample_data = [
        ("alice", "Spring2026!", "Alice Johnson", "alice@company.com", "Finance"),
        ("bob", "Welcome123", "Bob Smith", "bob@company.com", "IT"),
        ("charlie", "Qwerty!45", "Charlie Davis", "charlie@company.com", "HR"),
    ]

    cur.executemany(
        """
        INSERT INTO employees (username, password, full_name, email, department)
        VALUES (?, ?, ?, ?, ?)
        """,
        sample_data
    )

    conn.commit()
    conn.close()
    print("Database initialized: company.db")

if __name__ == "__main__":
    main()
