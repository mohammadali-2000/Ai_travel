import asyncio
import json
import secrets
from uuid import uuid4

from openai import AsyncOpenAI
from supabase import Client, create_client

from app.core.config import get_settings
from app.models.trips import AgentStatus, TripCreate, TripExperience, TripRecord

AGENT_PROMPTS = {
    "Experience Designer": "Create the title, premise, day-by-day emotional arc, map points, and hidden gems.",
    "Budget Agent": "Create a realistic budget breakdown. Totals must not exceed the stated budget.",
    "Weather Agent": "Write a careful seasonal weather window, packing note, and a weather contingency. Never claim a live forecast.",
    "Food Agent": "Curate distinctive food moments with neighborhood, reason, and price tier. Do not claim reservations or current opening hours.",
}


def _client() -> AsyncOpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError("AI service is not configured. Add OPENAI_API_KEY to apps/api/.env.")
    return AsyncOpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)


def _supabase() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ValueError("Trip storage is not configured. Add Supabase credentials to apps/api/.env.")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _brief(trip: TripCreate) -> str:
    return f"Destination: {trip.destination}\nDates: {trip.start_date} to {trip.end_date}\nBudget: {trip.currency} {trip.budget} for {trip.travelers} traveler(s)\nTravel intent: {trip.intent or 'Create a memorable, grounded first visit.'}"


async def _run_agent(name: str, instruction: str, trip: TripCreate) -> tuple[str, str]:
    response = await _client().responses.create(
        model=get_settings().openai_model,
        instructions=(f"You are the {name} for an AI-native travel experience. {instruction} "
                      "Return concise planning notes. Do not make bookings, claim live data, or invent exact business facts."),
        input=_brief(trip),
        max_output_tokens=500,
    )
    return name, response.output_text


async def generate_experience(trip: TripCreate) -> tuple[TripExperience, list[AgentStatus]]:
    results = await asyncio.gather(*[_run_agent(name, prompt, trip) for name, prompt in AGENT_PROMPTS.items()])
    research = "\n\n".join(f"{name}:\n{text}" for name, text in results)
    schema = json.dumps(TripExperience.model_json_schema())
    synthesis = await _client().responses.create(
        model=get_settings().openai_model,
        instructions="""You are the Journey Coordinator. Synthesize specialist research into one elegant travel experience.
Return ONLY valid JSON matching the supplied schema. Use only sound general knowledge and specialist notes.
Never claim live availability, live weather, prices, reservations, or exact opening hours. Budget amounts must add up to at most the stated budget.""",
        input=f"TRIP BRIEF\n{_brief(trip)}\n\nSPECIALIST NOTES\n{research}\n\nJSON SCHEMA\n{schema}",
        max_output_tokens=1_500,
    )
    try:
        experience = TripExperience.model_validate_json(synthesis.output_text)
    except ValueError as exc:
        raise ValueError("The AI response could not be validated. Please try generating this trip again.") from exc
    agents = [AgentStatus(agent=name, status="complete") for name in AGENT_PROMPTS]
    return experience, agents + [AgentStatus(agent="Journey Coordinator", status="complete")]


def save_trip(trip: TripCreate, experience: TripExperience, agents: list[AgentStatus]) -> TripRecord:
    record = TripRecord(id=str(uuid4()), owner_id=trip.owner_id, destination=trip.destination, start_date=trip.start_date, end_date=trip.end_date, budget=trip.budget, currency=trip.currency, travelers=trip.travelers, intent=trip.intent, share_slug=secrets.token_urlsafe(8), experience=experience, agents=agents)
    _supabase().table("trips").insert(record.model_dump(mode="json")).execute()
    return record


def fetch_trip(trip_id: str) -> TripRecord | None:
    response = _supabase().table("trips").select("*").eq("id", trip_id).maybe_single().execute()
    return TripRecord.model_validate(response.data) if response.data else None


def list_trips(owner_id: str) -> list[TripRecord]:
    response = _supabase().table("trips").select("*").eq("owner_id", owner_id).order("created_at", desc=True).execute()
    return [TripRecord.model_validate(item) for item in response.data]


def fetch_shared_trip(share_slug: str) -> TripRecord | None:
    response = _supabase().table("trips").select("*").eq("share_slug", share_slug).maybe_single().execute()
    return TripRecord.model_validate(response.data) if response.data else None
