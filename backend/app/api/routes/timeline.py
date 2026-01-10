from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, date, timezone, timedelta

from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.timeline import ActivityLogOut

router = APIRouter()

@router.get("/", response_model=List[ActivityLogOut])
def get_timeline(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated activity timeline for the current user.
    Timestamps are returned in UTC. Client should convert to local timezone.
    """
    activities = db.query(ActivityLog)\
        .filter(ActivityLog.user_id == current_user.id)\
        .order_by(desc(ActivityLog.timestamp))\
        .offset(skip)\
        .limit(limit)\
        .all()
    return activities

@router.get("/today", response_model=List[ActivityLogOut])
def get_today_timeline(
    tz_offset: int = 0,  # Client's timezone offset in minutes (e.g., -480 for UTC+8)
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all activities for the current user for today.
    tz_offset: Client's timezone offset in minutes from UTC (negative for east of UTC).
               Example: UTC+8 = -480, UTC-5 = 300
    """
    # Calculate the start of "today" in the client's timezone
    client_tz = timezone(timedelta(minutes=-tz_offset))
    now_in_client_tz = datetime.now(client_tz)
    today_start_client = now_in_client_tz.replace(hour=0, minute=0, second=0, microsecond=0)
    # Convert back to UTC for database query
    today_start_utc = today_start_client.astimezone(timezone.utc)
    
    activities = db.query(ActivityLog)\
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.timestamp >= today_start_utc
        )\
        .order_by(desc(ActivityLog.timestamp))\
        .all()
    return activities

