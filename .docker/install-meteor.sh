#!/bin/bash

set -e

  # download installer script
  curl https://install.meteor.com -o /tmp/install_meteor.sh

  # change tar command in the install script with bsdtar ( bsdtar -xf "$TARBALL_FILE" -C "$INSTALL_TMPDIR" )
  printf "\n[-] Changing tar with bsdtar...\n\n"
  sed -i.bak "s/tar -xzf.*/bsdtar -xf \"\$TARBALL_FILE\" -C \"\$INSTALL_TMPDIR\"/g" /tmp/install_meteor.sh

  # install
  printf "\n[-] Installing latest Meteor ...\n\n"
  sh /tmp/install_meteor.sh

