from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    KOMOJU_PUBLIC_KEY: str
    KOMOJU_SECRET_KEY: str
    AI_API_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SHARE_DEFAULT_CLICKS: int = 3
    SHARE_DEFAULT_DISCOUNT_PERCENTAGE: int = 10
    SHARE_DEFAULT_EXPIRES_HOURS: int = 24
    SHARE_MAX_DISCOUNT_PERCENTAGE: int = 50
    SHARE_IP_DUPLICATE_WINDOW_HOURS: int = 24

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
