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
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Cloud Database URL (Optional override)
    database_url_env: str | None = None

    class Config:
        env_file = ".env"
    
    @property
    def database_url(self) -> str:
        # 1. 优先使用完整连接字符串 (如果有)
        if self.database_url_env:
            return self.database_url_env
        
        # 2. 如果提供了 DB_HOST，尝试自动构建 PostgreSQL 连接字符串
        if self.db_host and self.db_host != "localhost":
            try:
                from urllib.parse import quote_plus
                # 对密码进行 URL 编码，处理特殊字符（如 #, % 等）
                encoded_password = quote_plus(self.db_password)
                return f"postgresql://{self.db_user}:{encoded_password}@{self.db_host}:{self.db_port}/{self.db_name}"
            except Exception as e:
                print(f"Error constructing database URL: {e}")
                # Fallback to default if construction fails
        
        # 3. 默认回退到本地 SQLite (开发环境)
        return "sqlite:///./sql_app.db"


settings = Settings()