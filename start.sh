#!/bin/bash
# Start script for production
cd frontend
PORT=${PORT:-10000} ./node_modules/.bin/next start -p $PORT