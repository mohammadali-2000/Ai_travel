import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents.coordinator import stream_journey_concept
from app.models.trips import TripCreate, TripRecord
from app.services.trips import fetch_shared_trip, fetch_trip, generate_experience, list_trips, save_trip

router = APIRouter(prefix="/journeys", tags=["journeys"])


class JourneyConceptRequest(BaseModel):
    intent: str = Field(min_length=3, max_length=1_500)


def unavailable(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=503, detail=str(exc))


async def sse_events(intent: str) -> AsyncIterator[str]:
    async for chunk in stream_journey_concept(intent):
        yield f"data: {json.dumps({'delta': chunk})}\n\n"
    yield "event: done\ndata: {}\n\n"


@router.post("/concept/stream")
async def create_journey_concept(payload: JourneyConceptRequest) -> StreamingResponse:
    """Streams the coordinator's first travel concept as server-sent events."""
    try:
        return StreamingResponse(sse_events(payload.intent), media_type="text/event-stream")
    except ValueError as exc:
        raise unavailable(exc) from exc


@router.post("", response_model=TripRecord, status_code=201)
async def create_trip(payload: TripCreate) -> TripRecord:
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=422, detail="End date must be on or after start date.")
    try:
        experience, agents = await generate_experience(payload)
        return save_trip(payload, experience, agents)
    except ValueError as exc:
        raise unavailable(exc) from exc


@router.get("", response_model=list[TripRecord])
async def get_trips(owner_id: str = Query(min_length=1, max_length=100)) -> list[TripRecord]:
    try:
        return list_trips(owner_id)
    except ValueError as exc:
        raise unavailable(exc) from exc


@router.get("/shared/{share_slug}", response_model=TripRecord)
async def get_shared_trip(share_slug: str) -> TripRecord:
    try:
        trip = fetch_shared_trip(share_slug)
    except ValueError as exc:
        raise unavailable(exc) from exc
    if not trip:
        raise HTTPException(status_code=404, detail="Shared journey not found.")
    return trip


@router.get("/{trip_id}", response_model=TripRecord)
async def get_trip(trip_id: str) -> TripRecord:
    try:
        trip = fetch_trip(trip_id)
    except ValueError as exc:
        raise unavailable(exc) from exc
    if not trip:
        raise HTTPException(status_code=404, detail="Journey not found.")
    return trip
