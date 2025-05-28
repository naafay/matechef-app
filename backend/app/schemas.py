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

class ChefRead(SQLModel):
    id: int
    name: str
    bio: Optional[str]
    class Config:
        orm_mode = True

class DishRead(SQLModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    chef_id: int
    class Config:
        orm_mode = True
