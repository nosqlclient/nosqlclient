#!/bin/bash

set -e

  printf "\n[-] Installing MongoDB ${MONGO_VERSION}...\n\n"

	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6

	echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/$MONGO_MAJOR multiverse" | tee /etc/apt/sources.list.d/mongodb-org.list

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
