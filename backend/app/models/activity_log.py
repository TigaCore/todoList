from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    todo_id = Column(Integer, ForeignKey("todos.id"), nullable=True)

    # Action types: "CREATE", "COMPLETE", "UNCOMPLETE", "UPDATE_CONTENT", "DELETE"
    action_type = Column(String, nullable=False)
    
    # Metadata to store snapshot info (e.g., title at the time of action)
    metadata_Snapshot = Column(JSON, nullable=True)

    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
