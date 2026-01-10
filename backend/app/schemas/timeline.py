from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ActivityLogBase(BaseModel):
    action_type: str
    todo_id: Optional[int] = None
    metadata_Snapshot: Optional[Dict[str, Any]] = None

class ActivityLogOut(BaseModel):
    id: int
    action_type: str
    todo_id: Optional[int]
    metadata_Snapshot: Optional[Dict[str, Any]]
    timestamp: datetime

    class Config:
        from_attributes = True
