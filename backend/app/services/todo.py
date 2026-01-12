from sqlalchemy.orm import Session
from app.models.todo import Todo
from app.models.activity_log import ActivityLog
from app.schemas.todo import TodoCreate, TodoUpdate

def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Todo).filter(Todo.user_id == user_id).offset(skip).limit(limit).all()

def get_todo(db: Session, todo_id: int, user_id: int):
    return db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()

def create_user_todo(db: Session, todo: TodoCreate, user_id: int):
    db_todo = Todo(**todo.model_dump(), user_id=user_id)
    db.add(db_todo)
    db.flush() # Flush to get the ID

    # Log Activity
    log = ActivityLog(
        user_id=user_id,
        todo_id=db_todo.id,
        action_type="CREATE",
        metadata_Snapshot={"title": db_todo.title}
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, db_todo: Todo, todo_update: TodoUpdate):
    update_data = todo_update.model_dump(exclude_unset=True)
    
    # Log Activity checks
    if "is_completed" in update_data:
        if update_data["is_completed"] != db_todo.is_completed:
            action = "COMPLETE" if update_data["is_completed"] else "UNCOMPLETE"
            log = ActivityLog(
                user_id=db_todo.user_id,
                todo_id=db_todo.id,
                action_type=action,
                metadata_Snapshot={"title": db_todo.title}
            )
            db.add(log)

    # Check for significant content updates (excluding minor typos if possible, but for now any change)
    # We prioritize content or title changes
    if ("content" in update_data and update_data["content"] != db_todo.content) or \
       ("title" in update_data and update_data["title"] != db_todo.title):
        # Avoid double logging if only status changed
        # We define a separate action type for content/title update
        log = ActivityLog(
            user_id=db_todo.user_id,
            todo_id=db_todo.id,
            action_type="UPDATE_CONTENT",
            metadata_Snapshot={"title": update_data.get("title", db_todo.title)}
        )
        db.add(log)

    for key, value in update_data.items():
        setattr(db_todo, key, value)
    
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, db_todo: Todo):
    # First, nullify all activity_log references to this todo to prevent FK violation
    db.query(ActivityLog).filter(ActivityLog.todo_id == db_todo.id).update(
        {ActivityLog.todo_id: None}
    )
    
    # Log Activity for the delete (with todo_id as None since we're deleting)
    log = ActivityLog(
        user_id=db_todo.user_id,
        todo_id=None,  # Set to None since todo is being deleted
        action_type="DELETE",
        metadata_Snapshot={"title": db_todo.title, "deleted_todo_id": db_todo.id}
    )
    db.add(log)
    
    db.delete(db_todo)
    db.commit()
    return db_todo
