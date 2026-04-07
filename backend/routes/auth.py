from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
import auth  # your backend/auth.py
from fastapi import HTTPException
from jose import jwt
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta

router = APIRouter()  

SECRET_KEY = "mysecret123"  # 🔐 you can change later
ALGORITHM = "HS256"


@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed = auth.hash_password(user.password)

    new_user = models.User(
        email=user.email,
        password=hashed
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")

    return {"message": "User created"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not db_user or not auth.verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


