# backend/app/models.py

from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.types import JSON

class UserFavoriteLink(SQLModel, table=True):
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", primary_key=True
    )
    chef_id: Optional[int] = Field(
        default=None, foreign_key="chef.id", primary_key=True
    )

class Chef(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", unique=True)
    name: str
    bio: Optional[str] = None

    favorited_by: List["User"] = Relationship(
        back_populates="favorites", link_model=UserFavoriteLink
    )
    dishes: List["Dish"] = Relationship(back_populates="chef")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name:  str
    username:   str = Field(index=True, unique=True)
    email:      str = Field(index=True, unique=True)
    hashed_password: str
    is_eater:   bool = Field(default=True)
    is_feeder:  bool = Field(default=False)
    profile_picture: Optional[str] = None

    # Role & onboarding fields
    active_role: Optional[str] = None  # 'eater' or 'feeder'
    address: Optional[str] = None
    id_verification: Optional[str] = None
    chef_id: Optional[int] = Field(default=None, foreign_key="chef.id")

    favorites: List["Chef"] = Relationship(
        back_populates="favorited_by", link_model=UserFavoriteLink
    )

class Dish(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    chef_id: int = Field(foreign_key="chef.id")
    image: Optional[str] = None

    # Feeder/meal extra fields
    is_kind: bool = Field(default=False)
    prep_time: Optional[int] = None
    pickup_available: bool = Field(default=True)
    delivery_available: bool = Field(default=False)
    pickup_location: Optional[str] = Field(default=None)
    pickup_coordinates: Optional[dict] = Field(default=None, sa_type=JSON)  # Store lat/lng as JSON in TEXT column for SQLite

    chef: Optional[Chef] = Relationship(back_populates="dishes")