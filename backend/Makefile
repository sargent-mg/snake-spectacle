.PHONY: install run test clean

install:
	uv sync

run:
	uv run uvicorn app.main:app --reload

test:
	uv run pytest

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
