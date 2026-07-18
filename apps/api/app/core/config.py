from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
