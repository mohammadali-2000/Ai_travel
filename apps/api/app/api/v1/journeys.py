import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents.coordinator import stream_journey_concept

router = APIRouter(prefix="/journeys", tags=["journeys"])


class JourneyConceptRequest(BaseModel):
    intent: str = Field(min_length=3, max_length=1_500)


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
        raise HTTPException(status_code=503, detail=str(exc)) from exc
