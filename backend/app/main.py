# backend/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, or_
from typing import List, Optional
from pydantic import BaseModel

from .database import engine, init_db
from .models import User, Chef, Dish, UserFavoriteLink
from .schemas import (
    UserCreate, Token, UserRead,
    ChefRead, DishRead, DishCreate,
)
from .auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)

app = FastAPI(title="MateChef API")

@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        # seed chefs if none
        if not session.exec(select(Chef)).first():
            session.add_all([
                Chef(name="Alice", bio="Mediterranean expert"),
                Chef(name="Bob",   bio="Grill master"),
            ])
            session.commit()
        # seed dishes if none
        if not session.exec(select(Dish)).first():
            session.add_all([
                Dish(name="Mediterranean Salad", description="Fresh greens", price=12.99, chef_id=1),
                Dish(name="Grilled Chicken",     description="Juicy & spicy", price=15.49, chef_id=2),
            ])
            session.commit()

@app.post("/signup", response_model=UserRead)
def signup(user_in: UserCreate):
    with Session(engine) as session:
        if session.exec(select(User).where(User.username == user_in.username)).first():
            raise HTTPException(status_code=400, detail="Username already registered")
        if session.exec(select(User).where(User.email == user_in.email)).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            is_eater=True,
            is_feeder=False,
            active_role=None,  # User must pick at login
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserRead(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            username=user.username,
            email=user.email,
            is_eater=user.is_eater,
            is_feeder=user.is_feeder,
            profile_picture=user.profile_picture,
            favorites=[],
            active_role=user.active_role,
            address=user.address,
            id_verification=user.id_verification,
        )

def find_user_by_username_or_email(session, username_or_email):
    user = session.exec(select(User).where(User.username == username_or_email)).first()
    if not user:
        user = session.exec(select(User).where(User.email == username_or_email)).first()
    return user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = find_user_by_username_or_email(session, form_data.username)
        if not user or not authenticate_user(session, user.username, form_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"access_token": create_access_token({"sub": user.username}), "token_type": "bearer"}

@app.get("/users/me", response_model=UserRead)
def read_users_me(current: User = Depends(get_current_user)):
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        links = session.exec(
            select(UserFavoriteLink).where(UserFavoriteLink.user_id == user_db.id)
        ).all()
        fav_ids = [link.chef_id for link in links]
        return UserRead(
            id=user_db.id,
            first_name=user_db.first_name,
            last_name=user_db.last_name,
            username=user_db.username,
            email=user_db.email,
            is_eater=user_db.is_eater,
            is_feeder=user_db.is_feeder,
            profile_picture=user_db.profile_picture,
            favorites=fav_ids,
            active_role=user_db.active_role,
            address=user_db.address,
            id_verification=user_db.id_verification,
        )

# PATCH role - accepts JSON body: {"role": "eater"} or {"role": "feeder"}
@app.patch("/users/me/role", summary="Switch between eater/feeder mode")
def switch_role(
    data: dict = Body(...),  # JSON body
    current: User = Depends(get_current_user)
):
    role = data.get("role")
    if role not in ("eater", "feeder"):
        raise HTTPException(status_code=400, detail="Role must be 'eater' or 'feeder'")
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        user_db.active_role = role
        session.add(user_db)
        session.commit()
        return {"active_role": user_db.active_role}

# PATCH address - expects {"address": "..."}
class AddressUpdate(BaseModel):
    address: str

@app.patch("/users/me/address", summary="Set or update feeder pickup address")
def update_address(
    body: AddressUpdate,
    current: User = Depends(get_current_user)
):
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        user_db.address = body.address
        session.add(user_db)
        session.commit()
        return {"address": user_db.address}

# POST id-verification - expects {"id_verification": "..."}
class IDVerificationUpdate(BaseModel):
    id_verification: str

@app.post("/users/me/id-verification", summary="Upload feeder ID (future-proof)")
def update_id_verification(
    body: IDVerificationUpdate,
    current: User = Depends(get_current_user)
):
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        user_db.id_verification = body.id_verification
        session.add(user_db)
        session.commit()
        return {"id_verification": user_db.id_verification}

@app.post("/users/me/dishes", response_model=DishRead, summary="Feeder creates new dish")
def create_dish(
    dish_in: DishCreate,
    current: User = Depends(get_current_user),
):
    with Session(engine) as session:
        new_dish = Dish(
            name=dish_in.name,
            description=dish_in.description,
            price=dish_in.price,
            chef_id=dish_in.chef_id,
            is_kind=dish_in.is_kind,
            prep_time=dish_in.prep_time,
            pickup_available=dish_in.pickup_available,
            delivery_available=dish_in.delivery_available,
        )
        session.add(new_dish)
        session.commit()
        session.refresh(new_dish)
        return new_dish

@app.post(
    "/users/me/favorites/{chef_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Add a chef to the current user's favorites",
)
def add_favorite(
    chef_id: int,
    current: User = Depends(get_current_user),
):
    with Session(engine) as session:
        if not session.get(Chef, chef_id):
            raise HTTPException(status_code=404, detail="Chef not found")
        exists = session.exec(
            select(UserFavoriteLink).where(
                (UserFavoriteLink.user_id == current.id)
                & (UserFavoriteLink.chef_id == chef_id)
            )
        ).first()
        if not exists:
            link = UserFavoriteLink(user_id=current.id, chef_id=chef_id)
            session.add(link)
            session.commit()

@app.delete(
    "/users/me/favorites/{chef_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a chef from the current user's favorites",
)
def remove_favorite(
    chef_id: int,
    current: User = Depends(get_current_user),
):
    with Session(engine) as session:
        link = session.exec(
            select(UserFavoriteLink).where(
                (UserFavoriteLink.user_id == current.id)
                & (UserFavoriteLink.chef_id == chef_id)
            )
        ).first()
        if link:
            session.delete(link)
            session.commit()

@app.get("/chefs", response_model=List[ChefRead])
def read_chefs():
    with Session(engine) as session:
        return session.exec(select(Chef)).all()

@app.get("/chefs/{chef_id}/dishes", response_model=List[DishRead])
def read_dishes_by_chef(chef_id: int):
    with Session(engine) as session:
        return session.exec(select(Dish).where(Dish.chef_id == chef_id)).all()

@app.get("/dishes", response_model=List[DishRead])
def read_dishes(filter: str = None):
    with Session(engine) as session:
        stmt = select(Dish)
        if filter:
            stmt = stmt.where(
                (Dish.name.contains(filter)) | (Dish.description.contains(filter))
            )
        return session.exec(stmt).all()
