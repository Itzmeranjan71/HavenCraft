from fastapi import APIRouter
from backend.database import get_db

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("")
def list_categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT c.id, c.name, c.description, c.icon, COUNT(p.id) as itemCount
    FROM categories c
    LEFT JOIN products p ON c.id = p.category
    GROUP BY c.id
    ORDER BY c.name ASC
    """)
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result
