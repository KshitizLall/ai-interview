#!/bin/bash
# Production script for deployment

# Install only production dependencies
poetry install --only=main,prod

# Run the production server
poetry run gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:10000
