# migrate_matechef_roles_and_meals_actual_schema.py

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

    # User table updates
    add_column_if_not_exists(conn, "user", "active_role", "TEXT", "DEFAULT 'eater'")
    add_column_if_not_exists(conn, "user", "address", "VARCHAR", "DEFAULT NULL")
    add_column_if_not_exists(conn, "user", "id_verification", "VARCHAR", "DEFAULT NULL")

    # Dish table updates
    add_column_if_not_exists(conn, "dish", "is_kind", "BOOLEAN", "DEFAULT 0")
    add_column_if_not_exists(conn, "dish", "prep_time", "INTEGER", "DEFAULT NULL")
    add_column_if_not_exists(conn, "dish", "pickup_available", "BOOLEAN", "DEFAULT 1")
    add_column_if_not_exists(conn, "dish", "delivery_available", "BOOLEAN", "DEFAULT 0")

    print("Migration complete.")
    conn.close()

if __name__ == "__main__":
    main()
