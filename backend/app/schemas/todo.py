from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    is_completed: Optional[bool] = False
    is_document: Optional[bool] = False  # True = standalone document
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    is_document: Optional[bool] = None
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None

class EmbeddedTask(BaseModel):
    """文档内嵌任务"""
    line_index: int           # 任务在文档中的行号
    text: str                 # 任务文本
    is_completed: bool        # 是否完成

class EmbeddedTaskUpdate(BaseModel):
    """更新内嵌任务状态"""
    line_index: int
    is_completed: bool

class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int
    embedded_tasks: List[EmbeddedTask] = []

    class Config:
        from_attributes = True
