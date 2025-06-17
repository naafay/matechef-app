# backend/migrate_add_pickup_location.py

import sqlite3

DB_PATH = "database.db"

def add_column_if_not_exists(conn, table, column, coltype, default_sql):
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cur.fetchall()]
    if column not in columns:
        print(f"Adding {column} to {table}...")
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coltype} {default_sql}")
        conn.commit()

def main():
    conn = sqlite3.connect(DB_PATH)

    # Dish table: add pickup_location
    add_column_if_not_exists(conn, "dish", "pickup_location", "VARCHAR", "DEFAULT NULL")

    print("Migration complete.")
    conn.close()

if __name__ == "__main__":
    main()
