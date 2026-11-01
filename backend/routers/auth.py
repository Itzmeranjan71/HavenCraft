from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import time
import uuid
from backend.database import get_db
from backend.models import (
    UserProfileUpdate,
    UserRoleUpdate,
    CouponValidateRequest,
    CouponValidateResponse,
    LoginRequest,
    RegisterRequest,
    AuthResponse
)

router = APIRouter(prefix="/api", tags=["Auth & User"])

def format_user_dict(row):
    d = dict(row)
    # Never expose password in responses
    d.pop("password", None)
    d["address"] = {
        "street": d.get("street") or "",
        "city": d.get("city") or "",
        "state": d.get("state") or "",
        "zip": d.get("zip_code") or "",
        "country": d.get("country") or "United States"
    }
    return d

def resolve_user_id(authorization: Optional[str] = None):
    """Extract user_id from Bearer token if provided, else default to usr-1001."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        parts = token.split("_")
        if len(parts) >= 3 and parts[0] == "hc" and parts[1] == "token":
            # format: hc_token_{user_id}_{timestamp}
            # user_id can be usr-1001 or prod-xxx
            user_id = parts[2]
            return user_id
    return "usr-1001"

# ----------------- LOGIN / REGISTER / LOGOUT -----------------

@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    password = payload.password.strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ? AND password = ?", (email, password))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")

    user = format_user_dict(row)
    token = f"hc_token_{user['id']}_{int(time.time())}"

    return AuthResponse(
        success=True,
        token=token,
        user=user,
        message=f"Welcome back, {user['name']}!"
    )

@router.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    name = payload.name.strip()
    password = payload.password.strip()

    if len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    new_id = f"usr-{int(uuid.uuid4().int % 1000000)}"
    default_avatar = f"https://api.dicebear.com/7.x/initials/svg?seed={name}&backgroundColor=b8860b,2b2722"

    cursor.execute("""
    INSERT INTO users (id, name, email, password, role, avatar, phone, street, city, state, zip_code)
    VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        name,
        email,
        password,
        default_avatar,
        payload.phone or "",
        payload.street or "",
        payload.city or "",
        payload.state or "",
        payload.zip_code or ""
    ))
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE id = ?", (new_id,))
    user = format_user_dict(cursor.fetchone())
    conn.close()

    token = f"hc_token_{new_id}_{int(time.time())}"
    return AuthResponse(
        success=True,
        token=token,
        user=user,
        message=f"Welcome to HavenCraft Living Atelier, {name}!"
    )

@router.post("/auth/logout")
def logout():
    return {
        "success": True,
        "message": "Successfully logged out of HavenCraft Atelier"
    }

@router.get("/auth/me")
def get_current_authenticated_user(authorization: Optional[str] = Header(None)):
    user_id = resolve_user_id(authorization)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_dict(row)

# ----------------- USER PROFILE & ROLE -----------------

@router.get("/user/profile")
def get_user_profile(authorization: Optional[str] = Header(None)):
    user_id = resolve_user_id(authorization)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_dict(row)

@router.put("/user/profile")
def update_user_profile(payload: UserProfileUpdate, authorization: Optional[str] = Header(None)):
    user_id = resolve_user_id(authorization)
    conn = get_db()
    cursor = conn.cursor()

    fields = []
    params = []
    if payload.name is not None:
        fields.append("name = ?")
        params.append(payload.name)
    if payload.email is not None:
        fields.append("email = ?")
        params.append(payload.email)
    if payload.phone is not None:
        fields.append("phone = ?")
        params.append(payload.phone)
    if payload.street is not None:
        fields.append("street = ?")
        params.append(payload.street)
    if payload.city is not None:
        fields.append("city = ?")
        params.append(payload.city)
    if payload.state is not None:
        fields.append("state = ?")
        params.append(payload.state)
    if payload.zip_code is not None:
        fields.append("zip_code = ?")
        params.append(payload.zip_code)

    if fields:
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = ?"
        params.append(user_id)
        cursor.execute(query, params)
        conn.commit()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return format_user_dict(row)

@router.post("/user/role")
def set_user_role(payload: UserRoleUpdate, authorization: Optional[str] = Header(None)):
    user_id = resolve_user_id(authorization)
    conn = get_db()
    cursor = conn.cursor()
    role = payload.role.lower()

    if role == "admin":
        name = "Alexander Vance (Operations Director)"
        email = "alexander.admin@furnicraft.luxury"
    else:
        role = "customer"
        name = "Sophia Laurent"
        email = "sophia.laurent@example.com"

    cursor.execute("UPDATE users SET role = ?, name = ?, email = ? WHERE id = ?", (role, name, email, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "role": role, "name": name, "email": email}

# ----------------- COUPONS -----------------

@router.post("/coupons/validate", response_model=CouponValidateResponse)
def validate_coupon(payload: CouponValidateRequest):
    code = payload.code.strip().upper()
    subtotal = payload.subtotal

    if code == "WELCOME10":
        discount = round(subtotal * 0.10, 2)
        return CouponValidateResponse(
            valid=True,
            code=code,
            discount=discount,
            message="10% Autumn welcome discount applied successfully!"
        )
    elif code == "LUXEFURNI":
        if subtotal >= 500:
            return CouponValidateResponse(
                valid=True,
                code=code,
                discount=150.0,
                message="$150 Architectural curation voucher applied!"
            )
        else:
            return CouponValidateResponse(
                valid=False,
                code=code,
                discount=0.0,
                message="LUXEFURNI requires a minimum order value of $500."
            )
    else:
        return CouponValidateResponse(
            valid=False,
            code=code,
            discount=0.0,
            message="Invalid coupon code. Try WELCOME10 or LUXEFURNI."
        )
