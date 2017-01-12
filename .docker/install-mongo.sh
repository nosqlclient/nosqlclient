#!/bin/bash

set -e

if [ -f $APP_SOURCE_DIR/launchpad.conf ]; then
  source <(grep INSTALL_MONGO $APP_SOURCE_DIR/launchpad.conf)
fi

if [ "$INSTALL_MONGO" = true ]; then
  printf "\n[-] Installing MongoDB ${MONGO_VERSION}...\n\n"

	apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 0C49F3730359A14518585931BC711F9BA15703C6

  echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/$MONGO_MAJOR main" > /etc/apt/sources.list.d/mongodb-org.list

	apt-get update

  apt-get install -y \
    ${MONGO_PACKAGE}=$MONGO_VERSION \
    ${MONGO_PACKAGE}-server=$MONGO_VERSION \
    ${MONGO_PACKAGE}-shell=$MONGO_VERSION \
    ${MONGO_PACKAGE}-mongos=$MONGO_VERSION \
    ${MONGO_PACKAGE}-tools=$MONGO_VERSION

	rm -rf /var/lib/apt/lists/*
	rm -rf /var/lib/mongodb
  mv /etc/mongod.conf /etc/mongod.conf.orig

fi
