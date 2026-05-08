from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://nsi:nsi_dev@localhost:5432/nsi_policy_hub"
    redis_url: str = "redis://localhost:6379/0"
    minio_endpoint: str = "localhost:9000"
    minio_bucket: str = "nsi-ocr-temp"
    service_port: int = 30312

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
