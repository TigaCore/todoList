from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "TodoList API"
    debug: bool = True
    
    # Database
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: str = "password"
    db_name: str = "todolist"
    
    # JWT
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "sercret-key-algorithm"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()