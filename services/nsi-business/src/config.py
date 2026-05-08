from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://nsi:nsi_dev@localhost:5432/nsi_business"
    account_center_url: str = "http://localhost:30311"
    policy_hub_url: str = "http://localhost:30312"
    actuarial_url: str = "http://localhost:30313"
    redis_url: str = "redis://localhost:6379/1"
    service_port: int = 30314
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
