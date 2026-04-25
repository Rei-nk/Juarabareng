from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from .database import create_db_and_tables, get_session
from . import models, auth

app = FastAPI(title="JuaraBareng API")

# Izinkan Frontend mengakses Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=models.UserRead)
def register(user_data: models.UserCreate, session: Session = Depends(get_session)):
    # Cek apakah user sudah ada
    existing_user = session.exec(select(models.User).where(
        (models.User.email == user_data.email) | (models.User.username == user_data.username)
    )).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username atau Email sudah terdaftar")
    
    # Simpan user baru
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=auth.get_password_hash(user_data.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=models.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # Cari user berdasarkan username
    user = session.exec(select(models.User).where(models.User.username == form_data.username)).first()
    
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau Password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buat Token
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- TESTING ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Welcome to JuaraBareng Backend API"}

@app.get("/api/test-connection")
def test_connection():
    return {"status": "connected", "message": "Backend FastAPI siap digunakan!"}
