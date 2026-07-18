from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class TripCreate(BaseModel):
    destination: str = Field(min_length=2, max_length=120)
    start_date: date
    end_date: date
    budget: int = Field(ge=100, le=10_000_000)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    travelers: int = Field(default=1, ge=1, le=12)
    intent: str = Field(default="", max_length=1_000)
    owner_id: str = Field(min_length=1, max_length=100)


class AgentStatus(BaseModel):
    agent: str
    status: Literal["complete", "failed"]


class ExperienceDay(BaseModel):
    day: int = Field(ge=1)
    title: str
    theme: str
    moments: list[str] = Field(min_length=2, max_length=5)


class BudgetLine(BaseModel):
    category: str
    amount: int = Field(ge=0)
    note: str


class WeatherWindow(BaseModel):
    summary: str
    packing_note: str
    contingency: str


class FoodPick(BaseModel):
    name: str
    neighborhood: str
    why: str
    price: Literal["$", "$$", "$$$", "$$$$"]


class TripExperience(BaseModel):
    title: str
    premise: str
    map_center: str
    map_points: list[str] = Field(min_length=3, max_length=6)
    itinerary: list[ExperienceDay] = Field(min_length=2, max_length=7)
    budget_breakdown: list[BudgetLine] = Field(min_length=3, max_length=6)
    weather: WeatherWindow
    food: list[FoodPick] = Field(min_length=3, max_length=5)
    packing: list[str] = Field(min_length=4, max_length=10)
    hidden_gems: list[str] = Field(min_length=2, max_length=5)


class TripRecord(BaseModel):
    id: str
    owner_id: str
    destination: str
    start_date: date
    end_date: date
    budget: int
    currency: str
    travelers: int
    intent: str
    share_slug: str
    created_at: datetime | None = None
    experience: TripExperience
    agents: list[AgentStatus]
