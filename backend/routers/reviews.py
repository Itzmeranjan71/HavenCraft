from fastapi import APIRouter, HTTPException
import datetime
import uuid
from backend.database import get_db
from backend.models import ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("/product/{product_id}")
def list_product_reviews(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, product_id, user_name as userName, rating, comment, review_date as date, verified
    FROM reviews
    WHERE product_id = ?
    ORDER BY review_date DESC
    """, (product_id,))
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

@router.post("/product/{product_id}", status_code=201)
def add_review(product_id: str, payload: ReviewCreate):
    conn = get_db()
    cursor = conn.cursor()

    # Check product exists
    cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    rev_id = f"rev-{int(uuid.uuid4().int % 1000000)}"
    today_str = datetime.date.today().isoformat()

    cursor.execute("""
    INSERT INTO reviews (id, product_id, user_name, rating, comment, review_date, verified)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (rev_id, product_id, payload.userName, payload.rating, payload.comment, today_str))

    # Recalculate average rating & review count for product
    cursor.execute("SELECT AVG(rating), COUNT(id) FROM reviews WHERE product_id = ?", (product_id,))
    avg_rating, count = cursor.fetchone()
    avg_rating = round(avg_rating, 1) if avg_rating else 5.0

    cursor.execute("UPDATE products SET rating = ?, review_count = ? WHERE id = ?", (avg_rating, count, product_id))
    conn.commit()

    cursor.execute("SELECT id, product_id, user_name as userName, rating, comment, review_date as date, verified FROM reviews WHERE id = ?", (rev_id,))
    created = dict(cursor.fetchone())
    conn.close()
    return created
