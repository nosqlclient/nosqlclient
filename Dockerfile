FROM jshimko/meteor-launchpad:latest

RUN cp -R /opt/meteor/dist/bundle/programs/server/npm/node_modules/tunnel-ssh  /opt/meteor/dist/bundle/programs/server/npm/node_modules/meteor/modules-runtime/node_modules/

MAINTAINER R.Sercan Özdemir <info@mongoclient.com>