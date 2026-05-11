import psycopg # type: ignore
from contextlib import contextmanager
from app.core.config import DATABASE_URL

@contextmanager
def db_cursor():
    conn = psycopg.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
