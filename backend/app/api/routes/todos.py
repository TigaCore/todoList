from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.schemas import todo as todo_schema
from app.services import todo as todo_service
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=todo_schema.TodoResponse)
def create_todo(
    todo: todo_schema.TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return todo_service.create_user_todo(db=db, todo=todo, user_id=current_user.id)

@router.get("/", response_model=List[todo_schema.TodoResponse])
def read_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todos = todo_service.get_todos(db, user_id=current_user.id, skip=skip, limit=limit)
    return todos

@router.get("/{todo_id}", response_model=todo_schema.TodoResponse)
def read_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/{todo_id}", response_model=todo_schema.TodoResponse)
def update_todo(
    todo_id: int,
    todo_update: todo_schema.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo_service.update_todo(db=db, db_todo=db_todo, todo_update=todo_update)

@router.delete("/{todo_id}", response_model=todo_schema.TodoResponse)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo_service.delete_todo(db=db, db_todo=db_todo)
