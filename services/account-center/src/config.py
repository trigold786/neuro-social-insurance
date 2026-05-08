from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://nsi:nsi_dev@postgres:5432/nsi_account"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    service_port: int = 30311

    aliyun_access_key_id: str = ""
    aliyun_access_key_secret: str = ""
    aliyun_sms_sign_name: str = "速通互联验证码"
    aliyun_sms_template_code: str = "SMS_12345678"
    aliyun_sms_enabled: bool = False

    smtp_host: str = "smtp.163.com"
    smtp_port: int = 465
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@nsi.example.com"
    smtp_enabled: bool = False

    verification_code_rate_limit_per_hour: int = 10
    verification_code_cooldown_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
