# backend/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List

from .database import engine, init_db
from .models import User, Chef, Dish, UserFavoriteLink
from .schemas import (
    UserCreate, Token, UserRead,
    ChefRead, DishRead
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
        )

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        user = authenticate_user(session, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"access_token": create_access_token({"sub": user.username}), "token_type": "bearer"}

@app.get("/users/me", response_model=UserRead)
def read_users_me(current: User = Depends(get_current_user)):
    # re-load user inside session to fetch favorites
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
        )

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
