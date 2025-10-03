#!/bin/bash
# Development script for local development

# Install dependencies
poetry install

# Run the development server
poetry run uvicorn main:app --host 0.0.0.0 --port 10000 --reload
