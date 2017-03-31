#!/bin/bash

set -e

if [ "$INSTALL_MONGO" = true ]; then
  printf "\n[-] Installing MongoDB 3.4.2...\n\n"

  cd /tmp
  curl -O -L https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian81-3.4.2.tgz
  tar xvzf mongodb-linux-x86_64-debian81-3.4.2.tgz
  rm mongodb-linux-x86_64-debian81-3.4.2.tgz

  rm -rf /opt/mongodb
  mv mongodb-linux-x86_64-debian81-3.4.2 /opt/mongodb

  ln -sf /opt/mongodb/bin/mongo /usr/bin/mongo
  ln -sf /opt/mongodb/bin/mongod /usr/bin/mongod

  mkdir -p /data/db
  chown -R node:node /data

  printf "\n[-] MongoDB installed successfully\n\n"

fi