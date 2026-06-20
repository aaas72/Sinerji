"""
Database connection pool and cursor management.
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Optional

from psycopg_pool import ConnectionPool

from app.config import DATABASE_URL

db_pool: Optional[ConnectionPool] = None


def open_pool() -> None:
    """Create and open the connection pool.  Called once during app startup."""
    global db_pool
    db_pool = ConnectionPool(DATABASE_URL)
    db_pool.open()


def close_pool() -> None:
    """Close the connection pool.  Called once during app shutdown."""
    global db_pool
    if db_pool is not None:
        db_pool.close()
        db_pool = None


@contextmanager
def db_cursor():
    """Yield a database cursor from the pool."""
    if db_pool is None:
        raise RuntimeError("Database pool not initialized")
    with db_pool.connection() as conn:
        with conn.cursor() as cur:
            yield cur
