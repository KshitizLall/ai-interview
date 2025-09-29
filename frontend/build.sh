#!/bin/bash
# Frontend build script for Render

# Clear npm cache
npm cache clean --force

# Install dependencies with legacy peer deps to handle compatibility issues
npm ci --legacy-peer-deps

# Run the build
npm run build

echo "Frontend build completed successfully!"