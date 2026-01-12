from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.schemas import todo as todo_schema
from app.services import todo as todo_service
from app.services import embedded_task as embedded_task_service
from app.models.user import User

router = APIRouter()


def _enrich_todo_response(db_todo) -> dict:
    """Convert Todo model to response dict with embedded_tasks parsed from content."""
    response = {
        "id": db_todo.id,
        "title": db_todo.title,
        "description": db_todo.description,
        "content": db_todo.content,
        "is_completed": db_todo.is_completed,
        "is_document": db_todo.is_document,
        "due_date": db_todo.due_date,
        "reminder_at": db_todo.reminder_at,
        "created_at": db_todo.created_at,
        "updated_at": db_todo.updated_at,
        "user_id": db_todo.user_id,
        "embedded_tasks": embedded_task_service.parse_embedded_tasks(db_todo.content or "")
    }
    return response


@router.post("/", response_model=todo_schema.TodoResponse)
def create_todo(
    todo: todo_schema.TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.create_user_todo(db=db, todo=todo, user_id=current_user.id)
    return _enrich_todo_response(db_todo)

@router.get("/", response_model=List[todo_schema.TodoResponse])
def read_todos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todos = todo_service.get_todos(db, user_id=current_user.id, skip=skip, limit=limit)
    return [_enrich_todo_response(todo) for todo in todos]

@router.get("/{todo_id}", response_model=todo_schema.TodoResponse)
def read_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return _enrich_todo_response(db_todo)

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
    updated_todo = todo_service.update_todo(db=db, db_todo=db_todo, todo_update=todo_update)
    return _enrich_todo_response(updated_todo)

@router.patch("/{todo_id}/embedded-task", response_model=todo_schema.TodoResponse)
def update_embedded_task(
    todo_id: int,
    task_update: todo_schema.EmbeddedTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an embedded task's completion status within a todo's content."""
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # Update the content with the new task status
    new_content = embedded_task_service.update_task_status(
        db_todo.content or "",
        task_update.line_index,
        task_update.is_completed
    )
    
    # Save the updated content
    content_update = todo_schema.TodoUpdate(content=new_content)
    updated_todo = todo_service.update_todo(db=db, db_todo=db_todo, todo_update=content_update)
    return _enrich_todo_response(updated_todo)

@router.delete("/{todo_id}", response_model=todo_schema.TodoResponse)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_todo = todo_service.get_todo(db, todo_id=todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    deleted_todo = todo_service.delete_todo(db=db, db_todo=db_todo)
    return _enrich_todo_response(deleted_todo)
