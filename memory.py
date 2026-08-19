# Import SQLite library for database operations
import sqlite3

# Create connection to SQLite database
conn = sqlite3.connect(
    "memory.db",
    check_same_thread=False
)

# Create database cursor
cursor = conn.cursor()

# Create history table if it does not exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    query TEXT
)
""")

# Save table changes
conn.commit()


# Store customer query in memory
def save_memory(customer_name, query):

    cursor.execute(
        """
        INSERT INTO history(customer_name,query)
        VALUES (?,?)
        """,
        (customer_name, query)
    )

    conn.commit()


# Retrieve customer's previous issue
def get_previous_issue(customer_name):

    cursor.execute(
        """
        SELECT query
        FROM history
        WHERE customer_name=?
        ORDER BY id DESC
        LIMIT 1 OFFSET 1
        """,
        (customer_name,)
    )

    row = cursor.fetchone()

    if row:
        return row[0]

    return "No previous issue found."