#!/bin/bash

set -e

# try to start local MongoDB if no external MONGO_URL was set
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  if hash mongod 2>/dev/null; then
    printf "\n[-] External MONGO_URL not found. Starting local MongoDB...\n\n"
    exec mongod --storageEngine=wiredTiger &
  else
    echo "ERROR: Mongo not installed inside the container."
    echo "Please supply a MONGO_URL environment variable."
    exit 1
  fi
fi

# Set a delay to wait to start the Node process
if [[ $STARTUP_DELAY ]]; then
  echo "Delaying startup for $STARTUP_DELAY seconds..."
  sleep $STARTUP_DELAY
fi

# Start app
echo "=> Starting app on port $PORT..."
exec "$@"