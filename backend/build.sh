#!/bin/bash
# Build script for Render deployment

# Install Poetry if not already installed
if ! command -v poetry &> /dev/null; then
    pip install poetry
fi

# Configure Poetry to not create virtual environment (for production)
poetry config virtualenvs.create false

# Install dependencies using Poetry
poetry install --only=main,prod

# Create necessary directories
mkdir -p uploads exports

echo "Backend build completed successfully!"
