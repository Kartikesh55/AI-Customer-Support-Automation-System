import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Dict, List, Optional

DATABASE_PATH = Path(__file__).resolve().parent.parent / "memory.db"

_COLUMN_DEFINITIONS = {
    "response": "TEXT",
    "retrieved_context": "TEXT",
    "memory_context": "TEXT",
    "intent": "TEXT",
    "department": "TEXT",
    "status": "TEXT NOT NULL DEFAULT 'completed'",
    "approval_required": "INTEGER NOT NULL DEFAULT 0",
    "approval_status": "TEXT",
    "created_at": "TEXT",
}


def _ensure_schema() -> None:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS history(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                query TEXT
            )
            """
        )
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(history)")
        }
        for column, definition in _COLUMN_DEFINITIONS.items():
            if column not in columns:
                connection.execute(
                    f"ALTER TABLE history ADD COLUMN {column} {definition}"
                )
        connection.commit()


_ensure_schema()


def save_memory(
    customer_name: str,
    query: str,
    *,
    request_id: Optional[int] = None,
    response: str = "",
    retrieved_context: str = "",
    memory_context: str = "",
    intent: str = "",
    department: str = "",
    status: str = "completed",
    approval_required: bool = False,
    approval_status: str = "",
) -> int:
    values = (
        response,
        retrieved_context,
        memory_context,
        intent,
        department,
        status,
        int(approval_required),
        approval_status,
    )
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        if request_id is None:
            cursor = connection.execute(
                """
                INSERT INTO history(
                    customer_name, query, response, retrieved_context,
                    memory_context, intent, department, status,
                    approval_required, approval_status, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (customer_name, query, *values),
            )
            saved_id = cursor.lastrowid
        else:
            cursor = connection.execute(
                """
                UPDATE history
                SET response = ?, retrieved_context = ?, memory_context = ?,
                    intent = ?, department = ?, status = ?,
                    approval_required = ?, approval_status = ?,
                    created_at = CURRENT_TIMESTAMP
                WHERE id = ? AND customer_name = ? AND query = ?
                    AND status = 'pending_approval'
                """,
                (*values, request_id, customer_name, query),
            )
            if cursor.rowcount != 1:
                raise ValueError("This support request is no longer awaiting approval.")
            saved_id = request_id
        connection.commit()
    return int(saved_id)


def get_request(request_id: int) -> Optional[Dict[str, object]]:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT * FROM history WHERE id = ?",
            (request_id,),
        ).fetchone()
    return dict(row) if row else None


def decline_request(
    request_id: int,
    customer_name: str,
    query: str,
) -> bool:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        cursor = connection.execute(
            """
            UPDATE history
            SET status = 'declined',
                approval_status = 'Declined',
                response = 'Approval was declined. No request was submitted or processed.',
                retrieved_context = '',
                memory_context = '',
                created_at = CURRENT_TIMESTAMP
            WHERE id = ? AND customer_name = ? AND query = ?
                AND status = 'pending_approval'
            """,
            (request_id, customer_name, query),
        )
        connection.commit()
    return cursor.rowcount == 1


def get_previous_issue(customer_name: str) -> str:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        row = connection.execute(
            """
            SELECT query
            FROM history
            WHERE customer_name = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (customer_name,),
        ).fetchone()

    return row[0] if row else "No previous issue found."


def get_dashboard_data() -> Dict[str, object]:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        total_requests = connection.execute(
            "SELECT COUNT(*) FROM history"
        ).fetchone()[0]
        unique_customers = connection.execute(
            "SELECT COUNT(DISTINCT customer_name) FROM history"
        ).fetchone()[0]

    return {
        "total_requests": total_requests,
        "unique_customers": unique_customers,
        "recent_queries": get_conversations(8),
    }


def get_conversations(limit: int = 100) -> List[Dict[str, object]]:
    with closing(sqlite3.connect(DATABASE_PATH)) as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT id, customer_name, query, response, retrieved_context,
                memory_context, intent, department, status,
                approval_required, approval_status, created_at
            FROM history
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]
