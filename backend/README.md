# Snake Spectacle Backend

This is the FastAPI backend for the Snake Spectacle game.

## Setup

1.  Ensure you have `uv` installed.
2.  Install dependencies:
    ```bash
    uv sync
    ```

## Running the Server

To start the development server with hot reload:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Documentation is available at `http://localhost:8000/docs`.

## Running Tests

To run the test suite:

```bash
uv run pytest
```
