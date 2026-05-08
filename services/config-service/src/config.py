from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://nsi:nsi_dev@localhost:5432/nsi_config"
    redis_url: str = "redis://localhost:6379/2"
    service_port: int = 30315
    jwt_secret: str = "dev-secret-change-me"
    admin_token: str = "nsi-admin-2024"
    encryption_key: str = "dev-enc-key-32bytes-long!!!"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
