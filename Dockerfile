#FROM meteorhacks/meteord:onbuild

FROM fedora:22

# Install required softwares
RUN dnf install -y tar procps-ng && dnf clean all

# Install MeteorJS
RUN curl https://install.meteor.com/ | sh

# Append mongoclient source, without cp -R it throws weird exceptions
WORKDIR /tmp/mongoclient
ADD / /tmp/mongoclient
RUN cp -R /tmp/mongoclient /opt/mongoclient
WORKDIR /opt/mongoclient

# pre-update some libraries
RUN /usr/local/bin/meteor update --unsafe-perm
RUN /usr/local/bin/meteor npm install --unsafe-perm

# Setup for run mongoclient
EXPOSE 3000
CMD ["/usr/local/bin/meteor --unsafe-perm", "run", "--port", "3000"]
