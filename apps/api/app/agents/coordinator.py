"""OpenAI Responses adapter for the journey coordinator agent."""

from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from app.core.config import get_settings

COORDINATOR_INSTRUCTIONS = """You are the RoamVerse Journey Coordinator.
Turn a travel desire into a concise, evocative journey concept, not an itinerary.
Write in a composed editorial voice. Surface a compelling destination direction, a mood,
one unexpected local texture, and a shareable title. Do not claim live availability,
make bookings, or invent factual details. Keep the response under 180 words."""


async def stream_journey_concept(intent: str) -> AsyncIterator[str]:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError("AI service is not configured. Add OPENAI_API_KEY to apps/api/.env.")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    async with client.responses.stream(
        model=settings.openai_model,
        instructions=COORDINATOR_INSTRUCTIONS,
        input=intent,
    ) as stream:
        async for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta
