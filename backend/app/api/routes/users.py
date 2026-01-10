from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.config import settings
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, Token, ChangePasswordRequest
from app.services.user import create_user, authenticate_user, get_user_by_email, update_user
from app.utils.auth import create_access_token, verify_password, get_password_hash
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.todo import Todo

router = APIRouter(tags=["users"])
security = HTTPBearer()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = create_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_user = update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}


@router.put("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(request.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    current_user.password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@router.get("/me/export")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all user's todos
    todos = db.query(Todo).filter(Todo.user_id == current_user.id).all()

    # Build export data
    export_data = {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "nickname": current_user.nickname,
            "created_at": current_user.created_at.isoformat(),
            "updated_at": current_user.updated_at.isoformat(),
        },
        "todos": [
            {
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "content": todo.content,
                "is_completed": todo.is_completed,
                "due_date": todo.due_date.isoformat() if todo.due_date else None,
                "reminder_at": todo.reminder_at.isoformat() if todo.reminder_at else None,
                "created_at": todo.created_at.isoformat(),
                "updated_at": todo.updated_at.isoformat(),
            }
            for todo in todos
        ],
        "export_time": datetime.utcnow().isoformat(),
    }

    return export_data