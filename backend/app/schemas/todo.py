from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    is_completed: Optional[bool] = False
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None

class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True
