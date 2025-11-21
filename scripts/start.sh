#!/bin/bash

# Create necessary directories
mkdir -p data uploads

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from template. Please edit it with your configuration."
fi

# Start the server
echo "Starting Contract Autofill Service..."
npm run build && npm start