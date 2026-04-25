from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Satu user bisa punya banyak project
    projects: List["Project"] = Relationship(back_populates="owner")

# --- SCHEMAS FOR API ---
class UserCreate(SQLModel):
    username: str
    email: str
    password: str

class UserRead(SQLModel):
    id: int
    username: str
    email: str
    created_at: datetime

class Token(SQLModel):
    access_token: str
    token_type: str

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Project dimiliki oleh satu user
    owner: User = Relationship(back_populates="projects")
    
    # Relationship ke Kompetisi (jika project didaftarkan ke kompetisi)
    kompetisi_id: Optional[int] = Field(default=None, foreign_key="kompetisi.id")
    kompetisi: Optional["Kompetisi"] = Relationship(back_populates="projects")

class Kompetisi(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    # Relationship: Satu kompetisi bisa diikuti banyak project
    projects: List[Project] = Relationship(back_populates="kompetisi")
