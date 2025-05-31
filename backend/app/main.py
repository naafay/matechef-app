# backend/app/main.py

import os
import shutil
import uuid
from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, or_
from typing import List, Optional

from .database import engine, init_db
from .models import User, Chef, Dish, UserFavoriteLink
from .schemas import (
    UserCreate, Token, UserRead,
    ChefRead, DishRead,
)
from .auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'static')
STATIC_DIR = os.path.abspath(STATIC_DIR)

app = FastAPI(title="MateChef API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
def on_startup():
    init_db()
    with Session(engine) as session:
        # Seed chefs if none
        if not session.exec(select(Chef)).first():
            session.add_all([
                Chef(name="Alice", bio="Mediterranean expert"),
                Chef(name="Bob", bio="Grill master"),
            ])
            session.commit()
        # Seed dishes if none
        if not session.exec(select(Dish)).first():
            session.add_all([
                Dish(name="Mediterranean Salad", description="Fresh greens", price=12.99, chef_id=1),
                Dish(name="Grilled Chicken", description="Juicy & spicy", price=15.49, chef_id=2),
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

        # Create Chef profile immediately so user.chef_id is available
        chef = Chef(user_id=user.id, name=f"{user.first_name} {user.last_name}", bio="")
        session.add(chef)
        session.commit()
        session.refresh(chef)
        user.chef_id = chef.id
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
            chef_id=user.chef_id,
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
            chef_id=user_db.chef_id,
        )

@app.patch("/users/me/role", summary="Switch between eater/feeder mode")
def switch_role(
    data: dict = Body(...),
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

@app.patch("/users/me/address", summary="Set or update feeder pickup address")
def update_address(
    data: dict = Body(...),
    current: User = Depends(get_current_user)
):
    address = data.get("address")
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        user_db.address = address
        session.add(user_db)
        session.commit()
        return {"address": user_db.address}

@app.post("/users/me/id-verification", summary="Upload feeder ID (future-proof)")
def update_id_verification(
    data: dict = Body(...),
    current: User = Depends(get_current_user)
):
    id_verification = data.get("id_verification")
    with Session(engine) as session:
        user_db = session.get(User, current.id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found")
        user_db.id_verification = id_verification
        session.add(user_db)
        session.commit()
        return {"id_verification": user_db.id_verification}

@app.post("/users/me/dishes", response_model=DishRead, summary="Feeder creates new dish")
async def create_dish(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    chef_id: int = Form(...),
    is_kind: bool = Form(False),
    prep_time: Optional[int] = Form(None),
    pickup_available: bool = Form(True),
    delivery_available: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    current: User = Depends(get_current_user)
):
    # Handle image upload with unique hash name
    image_url = None
    if image:
        ext = os.path.splitext(image.filename)[-1] or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(STATIC_DIR, unique_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/{unique_name}"

    with Session(engine) as session:
        # Double-check chef exists and belongs to user
        chef = session.get(Chef, chef_id)
        if not chef or chef.user_id != current.id:
            raise HTTPException(status_code=400, detail="Invalid chef_id")

        new_dish = Dish(
            name=name,
            description=description,
            price=price,
            chef_id=chef_id,
            is_kind=is_kind,
            prep_time=prep_time,
            pickup_available=pickup_available,
            delivery_available=delivery_available,
            image=image_url,
        )
        session.add(new_dish)
        session.commit()
        session.refresh(new_dish)
        return new_dish

@app.patch("/dishes/{dish_id}", response_model=DishRead)
async def update_dish(
    dish_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    chef_id: Optional[int] = Form(None),
    is_kind: Optional[bool] = Form(None),
    prep_time: Optional[int] = Form(None),
    pickup_available: Optional[bool] = Form(None),
    delivery_available: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current: User = Depends(get_current_user)
):
    with Session(engine) as session:
        dish = session.get(Dish, dish_id)
        if not dish:
            raise HTTPException(status_code=404, detail="Dish not found")
        if chef_id and dish.chef_id != chef_id:
            raise HTTPException(status_code=400, detail="Not your dish")

        if name is not None: dish.name = name
        if description is not None: dish.description = description
        if price is not None: dish.price = price
        if is_kind is not None: dish.is_kind = is_kind
        if prep_time is not None: dish.prep_time = prep_time
        if pickup_available is not None: dish.pickup_available = pickup_available
        if delivery_available is not None: dish.delivery_available = delivery_available

        # Handle image upload/update
        if image:
            ext = os.path.splitext(image.filename)[-1] or ".jpg"
            unique_name = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(STATIC_DIR, unique_name)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            dish.image = f"/static/{unique_name}"

        session.add(dish)
        session.commit()
        session.refresh(dish)
        return dish

@app.delete("/dishes/{dish_id}", status_code=204)
def delete_dish(
    dish_id: int,
    current: User = Depends(get_current_user)
):
    with Session(engine) as session:
        dish = session.get(Dish, dish_id)
        if not dish:
            raise HTTPException(status_code=404, detail="Dish not found")
        # Optional: Only the chef who owns this dish can delete
        chef = session.get(Chef, dish.chef_id)
        if chef.user_id != current.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        session.delete(dish)
        session.commit()
        return

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
