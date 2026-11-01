from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import json
import uuid
from backend.database import get_db
from backend.models import ProductCreate, ProductUpdate, StockUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])

def format_product_row(row, db_conn=None):
    d = dict(row)
    d["secondaryImages"] = json.loads(d.get("secondary_images") or "[]")
    d["materials"] = json.loads(d.get("materials") or "[]")
    d["finishes"] = json.loads(d.get("finishes") or "[]")
    d["dimensions"] = json.loads(d.get("dimensions") or "{}")
    d["features"] = json.loads(d.get("features") or "[]")
    d["originalPrice"] = d.get("original_price")
    d["reviewCount"] = d.get("review_count")

    # Fetch reviews if db_conn provided
    if db_conn:
        cur = db_conn.cursor()
        cur.execute("SELECT id, user_name as userName, rating, comment, review_date as date, verified FROM reviews WHERE product_id = ? ORDER BY review_date DESC", (d["id"],))
        d["reviews"] = [dict(r) for r in cur.fetchall()]
    return d

@router.get("")
def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("featured")
):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(materials) LIKE ?)"
        params.extend([s, s, s])

    if sort == "price-low":
        query += " ORDER BY price ASC"
    elif sort == "price-high":
        query += " ORDER BY price DESC"
    elif sort == "rating":
        query += " ORDER BY rating DESC"
    else:
        query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    result = [format_product_row(r) for r in rows]
    conn.close()
    return result

@router.get("/{product_id}")
def get_product(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Furniture piece not found")
    data = format_product_row(row, conn)
    conn.close()
    return data

@router.post("", status_code=201)
def create_product(payload: ProductCreate):
    conn = get_db()
    cursor = conn.cursor()
    prod_id = f"prod-{int(uuid.uuid4().int % 1000000)}"

    cursor.execute("""
    INSERT INTO products (
        id, sku, title, category, price, original_price, stock, badge,
        image, secondary_images, materials, finishes, dimensions, description, features
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        prod_id,
        payload.sku,
        payload.title,
        payload.category,
        payload.price,
        payload.original_price,
        payload.stock,
        payload.badge or "New Release",
        payload.image,
        json.dumps(payload.secondary_images or []),
        json.dumps(payload.materials or []),
        json.dumps([f.dict() for f in (payload.finishes or [])]),
        json.dumps(payload.dimensions or {}),
        payload.description,
        json.dumps(payload.features or [])
    ))
    conn.commit()

    cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
    created = format_product_row(cursor.fetchone())
    conn.close()
    return created

@router.put("/{product_id}")
def update_product(product_id: str, payload: ProductUpdate):
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    params = []
    if payload.title is not None:
        fields.append("title = ?")
        params.append(payload.title)
    if payload.category is not None:
        fields.append("category = ?")
        params.append(payload.category)
    if payload.price is not None:
        fields.append("price = ?")
        params.append(payload.price)
    if payload.original_price is not None:
        fields.append("original_price = ?")
        params.append(payload.original_price)
    if payload.stock is not None:
        fields.append("stock = ?")
        params.append(payload.stock)
    if payload.badge is not None:
        fields.append("badge = ?")
        params.append(payload.badge)
    if payload.image is not None:
        fields.append("image = ?")
        params.append(payload.image)
    if payload.description is not None:
        fields.append("description = ?")
        params.append(payload.description)

    if not fields:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields provided for update")

    params.append(product_id)
    cursor.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", params)
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    conn.commit()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    updated = format_product_row(cursor.fetchone(), conn)
    conn.close()
    return updated

@router.put("/{product_id}/stock")
def update_stock(product_id: str, payload: StockUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE products SET stock = ? WHERE id = ?", (payload.stock, product_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
    conn.commit()
    conn.close()
    return {"success": True, "productId": product_id, "stock": payload.stock}

@router.delete("/{product_id}")
def delete_product(product_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Product {product_id} retired from catalog"}
