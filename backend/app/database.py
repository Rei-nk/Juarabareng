import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session

load_dotenv()

# Gunakan DATABASE_URL dari Supabase (Connection String)
# Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
