#!/bin/bash
 
set -e

if [ "$INSTALL_MONGO" = true ]; then
  printf "\n[-] Installing MongoDB 4.2...\n\n"
 
  cd /tmp
  curl -O -L https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian92-v4.2-latest.tgz
  mkdir mongodb-linux-x86_64-debian92-v4.2
  tar xvzf mongodb-linux-x86_64-debian92-v4.2-latest.tgz --strip 1 -C mongodb-linux-x86_64-debian92-v4.2
  rm mongodb-linux-x86_64-debian92-v4.2-latest.tgz

  rm -rf /opt/mongodb
  mv mongodb-linux-x86_64-debian92-v4.2 /opt/mongodb

  ln -sf /opt/mongodb/bin/mongo /usr/bin/mongo
  ln -sf /opt/mongodb/bin/mongod /usr/bin/mongod

  mkdir -p /data/db
  chown -R node:node /data

  printf "\n[-] MongoDB installed successfully\n\n"

fi