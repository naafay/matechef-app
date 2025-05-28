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
        # If no chefs exist, seed some demo data
        first_chef = session.exec(select(Chef)).first()
        if not first_chef:
            chef1 = Chef(name="Chef Alice", bio="Mediterranean specialist")
            chef2 = Chef(name="Chef Ben", bio="Grill and BBQ expert")
            session.add_all([chef1, chef2])
            session.commit()
            # Now add demo dishes
            session.add_all([
                Dish(name="Mediterranean Salad", price=12.99, chef_id=chef1.id),
                Dish(name="Grilled Chicken",     price=15.49, chef_id=chef2.id),
            ])
            session.commit()


@app.get("/chefs/", response_model=list[Chef])
def read_chefs():
    """
    List all chefs.
    """
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
    """
    List dishes for a specific chef.
    """
    with Session(engine) as session:
        dishes = session.exec(select(Dish).where(Dish.chef_id == chef_id)).all()
        if dishes is None:
            raise HTTPException(status_code=404, detail="Chef not found")
        return dishes
