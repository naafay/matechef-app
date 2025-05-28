# backend/app/main.py

from fastapi import FastAPI, HTTPException
from sqlmodel import Session, select
from .database import engine, init_db
from .models import Chef, Dish

app = FastAPI(title="MateChef API")


@app.on_event("startup")
def on_startup():
    """
    Initialize database tables and seed demo data if empty.
    """
    init_db()
    with Session(engine) as session:
        # Only seed if no chefs exist yet
        if session.exec(select(Chef)).first() is None:
            # 1) Create chefs
            chef1 = Chef(name="Chef Alice", bio="Mediterranean specialist")
            chef2 = Chef(name="Chef Ben",   bio="Grill and BBQ expert")
            session.add_all([chef1, chef2])
            session.commit()

            # 2) Seed multiple dishes per chef
            dishes = [
                # Chef Alice’s dishes
                Dish(name="Mediterranean Salad",      price=12.99, chef_id=chef1.id),
                Dish(name="Vegetarian Pasta",         price=11.50, chef_id=chef1.id),
                Dish(name="Organic Green Smoothie",   price=8.00,  chef_id=chef1.id),
                Dish(name="Falafel Bowl",             price=10.25, chef_id=chef1.id),

                # Chef Ben’s dishes
                Dish(name="Grilled Chicken",          price=15.49, chef_id=chef2.id),
                Dish(name="Beef Tacos",               price=13.75, chef_id=chef2.id),
                Dish(name="Gluten-Free Bread",        price=6.75,  chef_id=chef2.id),
                Dish(name="Fish Tacos",               price=14.25, chef_id=chef2.id),
            ]
            session.add_all(dishes)
            session.commit()


@app.get("/chefs/", response_model=list[Chef])
def read_chefs():
    """List all chefs."""
    with Session(engine) as session:
        return session.exec(select(Chef)).all()


@app.get("/dishes/", response_model=list[Dish])
def read_dishes(filter: str = None):
    """
    List all dishes, optionally filtering by substring in the name.
    """
    with Session(engine) as session:
        stmt = select(Dish)
        if filter:
            stmt = stmt.where(Dish.name.contains(filter))
        return session.exec(stmt).all()


@app.get("/chefs/{chef_id}/dishes", response_model=list[Dish])
def read_dishes_by_chef(chef_id: int):
    """List dishes for a specific chef."""
    with Session(engine) as session:
        dishes = session.exec(select(Dish).where(Dish.chef_id == chef_id)).all()
        if not dishes:
            raise HTTPException(status_code=404, detail="Chef not found")
        return dishes
