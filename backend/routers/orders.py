from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import datetime
import random
from backend.database import get_db
from backend.models import OrderCreate, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def fetch_order_with_items(cursor, order_id):
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = cursor.fetchone()
    if not row:
        return None
    d = dict(row)
    cursor.execute("SELECT id, product_id, title, price, quantity, finish, image FROM order_items WHERE order_id = ?", (order_id,))
    d["items"] = [dict(i) for i in cursor.fetchall()]
    d["shippingAddress"] = {
        "street": d.get("street") or "",
        "city": d.get("city") or "",
        "state": d.get("state") or "",
        "zip": d.get("zip_code") or ""
    }
    d["date"] = d.get("order_date")
    d["trackingNumber"] = d.get("tracking_number")
    d["customerName"] = d.get("customer_name")
    d["customerEmail"] = d.get("customer_email")
    return d

@router.get("")
def list_orders(email: Optional[str] = Query(None)):
    conn = get_db()
    cursor = conn.cursor()
    if email and email.strip():
        cursor.execute("SELECT id FROM orders WHERE customer_email = ? ORDER BY created_at DESC", (email.strip(),))
    else:
        cursor.execute("SELECT id FROM orders ORDER BY created_at DESC")
    ids = [r["id"] for r in cursor.fetchall()]

    orders = []
    for oid in ids:
        o = fetch_order_with_items(cursor, oid)
        if o:
            orders.append(o)
    conn.close()
    return orders

@router.get("/{order_id}")
def get_order(order_id: str):
    conn = get_db()
    cursor = conn.cursor()
    order = fetch_order_with_items(cursor, order_id)
    conn.close()
    if not order:
        raise HTTPException(status_code=404, detail="Order commission not found")
    return order

@router.post("", status_code=201)
def create_order(payload: OrderCreate):
    conn = get_db()
    cursor = conn.cursor()

    order_id = f"ORD-{random.randint(1000, 9999)}"
    tracking_num = f"FX-{random.randint(10000, 99999)}-US"
    today_str = datetime.date.today().isoformat()

    try:
        # 1. Insert order record
        cursor.execute("""
        INSERT INTO orders (
            id, customer_name, customer_email, order_date, status, subtotal,
            shipping, discount, tax, total, tracking_number, street, city, state, zip_code, delivery_notes
        ) VALUES (?, ?, ?, ?, 'Processing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            payload.customerName,
            payload.customerEmail,
            today_str,
            payload.subtotal,
            payload.shipping,
            payload.discount,
            payload.tax,
            payload.total,
            tracking_num,
            payload.shippingAddress.get("street", ""),
            payload.shippingAddress.get("city", ""),
            payload.shippingAddress.get("state", ""),
            payload.shippingAddress.get("zip", ""),
            payload.deliveryNotes or ""
        ))

        # 2. Insert order items & deduct stock
        for item in payload.items:
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, title, price, quantity, finish, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                order_id,
                item.id,
                item.title,
                item.price,
                item.quantity,
                item.finish or "Standard",
                item.image or "/images/hero.jpg"
            ))

            # Deduct stock if available
            cursor.execute("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", (item.quantity, item.id))

        conn.commit()

        # 3. Retrieve complete created order
        order = fetch_order_with_items(cursor, order_id)
        conn.close()
        return order

    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to commission order: {str(e)}")

@router.put("/{order_id}/status")
def update_status(order_id: str, payload: OrderStatusUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (payload.status, order_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    conn.commit()
    order = fetch_order_with_items(cursor, order_id)
    conn.close()
    return order
