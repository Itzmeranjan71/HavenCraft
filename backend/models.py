from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FinishSchema(BaseModel):
    name: str
    color: str
    priceOffset: float = 0.0

class ProductBase(BaseModel):
    sku: str
    title: str
    category: str
    price: float
    original_price: Optional[float] = None
    stock: int = 10
    badge: Optional[str] = None
    image: str
    secondary_images: Optional[List[str]] = []
    materials: Optional[List[str]] = []
    finishes: Optional[List[FinishSchema]] = []
    dimensions: Optional[Dict[str, Any]] = None
    description: str
    features: Optional[List[str]] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock: Optional[int] = None
    badge: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None

class StockUpdate(BaseModel):
    stock: int

class OrderItemInput(BaseModel):
    id: str # product_id
    title: str
    price: float
    quantity: int = 1
    finish: Optional[str] = "Standard"
    image: Optional[str] = None

class OrderCreate(BaseModel):
    customerName: str
    customerEmail: str
    items: List[OrderItemInput]
    subtotal: float
    shipping: float = 0.0
    discount: float = 0.0
    tax: float = 0.0
    total: float
    shippingAddress: Dict[str, str]
    deliveryNotes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str # 'Processing', 'Shipped', 'Delivered'

class ReviewCreate(BaseModel):
    userName: str
    rating: int = Field(ge=1, le=5)
    comment: str

class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount: float
    message: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str # 'customer' or 'admin'

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    token: str
    user: Dict[str, Any]
    message: str

