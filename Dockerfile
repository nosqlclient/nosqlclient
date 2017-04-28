FROM jshimko/meteor-launchpad:latest
MAINTAINER R.Sercan Özdemir <info@mongoclient.com>

ENV INSTALL_MONGO true

# fix tunnel-ssh npm missing module
RUN cp -R $APP_BUNDLE_DIR/bundle/programs/server/npm/node_modules/tunnel-ssh $APP_BUNDLE_DIR/bundle/programs/server/npm/node_modules/meteor/modules-runtime/node_modules/