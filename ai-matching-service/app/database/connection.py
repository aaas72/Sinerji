import psycopg # type: ignore
# pyrefly: ignore [missing-import]
from psycopg_pool import ConnectionPool
from contextlib import contextmanager
from app.core.config import DATABASE_URL

# Initialize Connection Pool globally
pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10, open=True)

@contextmanager
def db_cursor():
    with pool.connection() as conn:
        try:
            with conn.cursor() as cur:
                yield cur
            conn.commit()
        except Exception:
            conn.rollback()
            raise
