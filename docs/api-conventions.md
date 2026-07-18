# API conventions

- Version external endpoints under `/api/v1` before public release.
- Use Pydantic models for every request and response payload.
- Return RFC 9457-style problem details for errors.
- Long-running agent runs must be asynchronous, idempotent, observable, and cancellable.
- Never send provider credentials or raw internal tool traces to clients.
