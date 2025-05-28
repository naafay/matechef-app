# backend/app/database.py

from sqlmodel import SQLModel, create_engine

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
