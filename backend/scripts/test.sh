#!/bin/bash
# Test script

# Install all dependencies including dev
poetry install

# Run tests
poetry run pytest

# Run linting
poetry run black .
poetry run isort .
poetry run flake8 .
poetry run mypy .
