"""
DirtyNest SQLite -> PostgreSQL Data Migration Script
Migrates todos, notes, quick_links, calendar_events, focus_sessions, system_logs, and hermes tables.
"""

import os
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dirtynest-migration")

SQLITE_PATH = os.environ.get("SQLITE_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "dirtynest.db"))
PG_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://dirtynest:ae132a343bbfe69efb3e083a176c695d@localhost:5432/dirtynest"
)

def run_migration():
    if not os.path.exists(SQLITE_PATH):
        logger.warning(f"No SQLite database found at {SQLITE_PATH}. Nothing to migrate.")
        return

    logger.info(f"Opening SQLite database at {SQLITE_PATH}...")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    logger.info(f"Connecting to PostgreSQL at {PG_URL.split('@')[-1]}...")
    try:
        pg_conn = psycopg2.connect(PG_URL)
        pg_cur = pg_conn.cursor()
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")
        return

    # Check tables in SQLite
    sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row["name"] for row in sqlite_cur.fetchall() if not row["name"].startswith("sqlite_")]
    logger.info(f"Found SQLite tables: {tables}")

    migrated_counts = {}

    for table in tables:
        try:
            sqlite_cur.execute(f"SELECT * FROM {table}")
            rows = sqlite_cur.fetchall()
            if not rows:
                logger.info(f"Table {table} is empty. Skipping.")
                continue

            columns = list(rows[0].keys())
            col_names = ", ".join(f'"{c}"' for c in columns)
            placeholders = ", ".join(["%s"] * len(columns))

            logger.info(f"Migrating {len(rows)} rows for table '{table}'...")

            data = [tuple(row[c] for c in columns) for row in rows]

            query = f'INSERT INTO "{table}" ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
            pg_cur.executemany(query, data)
            pg_conn.commit()

            migrated_counts[table] = len(rows)
            logger.info(f"Successfully migrated {len(rows)} records into '{table}'.")
        except Exception as e:
            pg_conn.rollback()
            logger.warning(f"Could not migrate table {table}: {e}")

    sqlite_conn.close()
    pg_conn.close()
    logger.info(f"Migration completed! Summary: {migrated_counts}")

if __name__ == "__main__":
    run_migration()
