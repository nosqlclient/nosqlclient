#!/bin/bash

set -e

# try to start local MongoDB if no external MONGO_URL was set
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  if hash mongod 2>/dev/null; then
    printf "\n[-] External MONGO_URL not found. Starting local MongoDB...\n\n"
    chown -R node:node /data
    exec gosu node mongod --storageEngine=wiredTiger > /dev/null 2>&1 &
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

if [ "${1:0:1}" = '-' ]; then
	set -- node "$@"
fi

# allow the container to be started with `--user`
if [ "$1" = "node" -a "$(id -u)" = "0" ]; then
	exec gosu node "$BASH_SOURCE" "$@"
fi

if [ "$1" = "node" ]; then
	numa="numactl --interleave=all"
	if $numa true &> /dev/null; then
		set -- $numa "$@"
	fi
fi

# Start app
echo "=> Starting app on port $PORT..."
exec "$@"