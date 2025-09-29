#!/bin/bash
# Build script for Render deployment

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads exports

echo "Backend build completed successfully!"