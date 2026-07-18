"""Manual real-provider evidence runner; never stores credentials or trip data."""

import asyncio
import json
import time

from app.core.config import get_settings
from app.models.trips import TripCreate, TripExperience
from app.services.trips import AGENT_PROMPTS, _brief, _client


TRIP = TripCreate(
    destination="Japan", start_date="2026-10-01", end_date="2026-10-07",
    budget=150000, currency="INR", travelers=2, intent="Food and Culture", owner_id="e2e-proof",
)


async def main() -> None:
    settings = get_settings()
    started = time.perf_counter()
    traces: list[dict[str, object]] = []
    for name, scope in AGENT_PROMPTS.items():
        instructions = (
            f"You are the {name} for an AI-native travel experience. {scope} "
            "Return concise planning notes. Do not make bookings, claim live data, or invent exact business facts."
        )
        agent_started = time.perf_counter()
        response = await _client().responses.create(
            model=settings.openai_model, instructions=instructions, input=_brief(TRIP), max_output_tokens=500,
        )
        traces.append({"agent": name, "instructions": instructions, "input": _brief(TRIP), "raw_response": response.output_text, "usage": response.usage.model_dump() if response.usage else None, "seconds": round(time.perf_counter() - agent_started, 3)})

    research = "\n\n".join(f"{item['agent']}:\n{item['raw_response']}" for item in traces)
    instructions = (
        "You are the Journey Coordinator. Synthesize specialist research into one elegant travel experience. "
        "Return ONLY valid JSON matching the supplied schema. Use only sound general knowledge and specialist notes. "
        "Never claim live availability, live weather, prices, reservations, or exact opening hours. "
        "Budget amounts must add up to at most the stated budget."
    )
    coordinator_input = f"TRIP BRIEF\n{_brief(TRIP)}\n\nSPECIALIST NOTES\n{research}\n\nJSON SCHEMA\n{json.dumps(TripExperience.model_json_schema())}"
    coordinator_started = time.perf_counter()
    response = await _client().responses.create(model=settings.openai_model, instructions=instructions, input=coordinator_input, max_output_tokens=1500)
    result: dict[str, object] = {"model": settings.openai_model, "specialists": traces, "coordinator": {"instructions": instructions, "input": coordinator_input, "raw_response": response.output_text, "usage": response.usage.model_dump() if response.usage else None, "seconds": round(time.perf_counter() - coordinator_started, 3)}, "elapsed_seconds": round(time.perf_counter() - started, 3)}
    try:
        result["final_json"] = TripExperience.model_validate_json(response.output_text).model_dump(mode="json")
    except ValueError as exc:
        result["validation_error"] = str(exc)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
