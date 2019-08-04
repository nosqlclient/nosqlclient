#!/bin/bash

set -e

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
    echo $var
    echo "$var"
    echo $fileVar
    echo "$fileVar"
		exit 1
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

file_env 'MONGO_SCHEME'
file_env 'MONGO_USERNAME'
file_env 'MONGO_PASSWORD'
file_env 'MONGO_ADDRESSES'
file_env 'MONGO_OPT_PARAMS'
file_env 'MONGO_DATABASE'
file_env 'MONGO_TLS'
file_env 'MONGO_URL'

MONGO_SCHEME=${MONGO_SCHEME:-mongodb}
MONGO_ADDRESSES=${MONGO_ADDRESSES:-127.0.0.1:27017}
MONGO_DATABASE=${MONGO_DATABASE:-meteor}

URL=
if [ "${MONGO_URL}" == "" ]
then
    URL=${MONGO_SCHEME}://
    if [ ! -z ${MONGO_USERNAME} ]
    then
        URL=${URL}${MONGO_USERNAME}
        if [ ! -z ${MONGO_PASSWORD} ]
    	then
    	    URL=${URL}:${MONGO_PASSWORD}
    	fi
        URL=${URL}@
    fi
    URL=${URL}${MONGO_ADDRESSES}/${MONGO_DATABASE}
    if [ -z ${MONGO_TLS} ]
    then
        URL="${URL}?ssl=false"
    else
        URL="${URL}?ssl=${MONGO_TLS}"
    fi
    if [ ! -z ${MONGO_OPT_PARAMS} ]
    then
        URL="${URL}&${MONGO_OPT_PARAMS}"
    fi
    MONGO_URL=${URL}
fi

file_env 'MONGOCLIENT_DEFAULT_CONNECTION_URL'

if [ "${MONGOCLIENT_DEFAULT_CONNECTION_URL}" == "" ]
then
	MONGOCLIENT_DEFAULT_CONNECTION_URL=$URL
fi

file_env 'MONGOCLIENT_USERNAME'
file_env 'MONGOCLIENT_PASSWORD'

# Default connection URL in case no connection URL is provided using the environment variables
MONGO_URL=${MONGO_URL:-mongodb://127.0.0.1:27017/meteor}

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
