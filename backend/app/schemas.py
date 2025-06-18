# backend/app/schemas.py

from typing import Optional, List
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    first_name: str
    last_name:  str
    username:   str
    email:      str
    password:   str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(SQLModel):
    username: Optional[str] = None

class UserRead(SQLModel):
    id: int
    first_name: str
    last_name: str
    username: str
    email: str
    is_eater: bool
    is_feeder: bool
    profile_picture: Optional[str]
    favorites: List[int] = []
    active_role: Optional[str] = None
    address: Optional[str] = None
    id_verification: Optional[str] = None
    chef_id: Optional[int] = None

class ChefRead(SQLModel):
    id: int
    user_id: Optional[int]
    name: str
    bio: Optional[str]
    class Config:
        from_attributes = True

class DishCreate(SQLModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    is_kind: Optional[bool] = False
    prep_time: Optional[int] = None
    pickup_available: Optional[bool] = True
    delivery_available: Optional[bool] = False
    pickup_location: Optional[str] = None
    pickup_coordinates: Optional[dict] = None  # e.g., {"latitude": float, "longitude": float}

class DishRead(SQLModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    chef_id: int
    image: Optional[str]
    is_kind: Optional[bool] = False
    prep_time: Optional[int] = None
    pickup_available: Optional[bool] = True
    delivery_available: Optional[bool] = False
    pickup_location: Optional[str] = None
    pickup_coordinates: Optional[dict] = None  # e.g., {"latitude": float, "longitude": float}

    class Config:
        from_attributes = True