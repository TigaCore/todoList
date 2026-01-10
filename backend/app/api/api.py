from fastapi import APIRouter
from app.api.routes import users, todos, timeline

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(todos.router, prefix="/todos", tags=["todos"])
api_router.include_router(timeline.router, prefix="/timeline", tags=["timeline"])