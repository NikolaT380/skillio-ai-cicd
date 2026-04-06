from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Recruitment System API"
    VERSION: str = "1.0.0"

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432

    @property
    def DATABASE_URL(self) -> str: # building the dynamic connection string
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    STORAGE_TYPE: str = "local"
    LOCAL_STORAGE_DIR: str = "/app/storage"
    TEMP_UPLOAD_DIR: str = "/app/uploads"


    OPENAI_API_KEY: str | None = None
    EMBEDDING_MODEL_NAME: str = "text-embedding-3-small"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
