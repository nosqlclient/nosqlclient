#!/bin/bash

set -e

#!/bin/sh

# This is the Meteor install script!
#
# Are you looking at this in your web browser, and would like to install Meteor?
#
# MAC AND LINUX:
#   Just open up your terminal and type:
#
#     curl https://install.meteor.com/ | sh
#
#   Meteor currently supports:
#    - Mac: OS X 10.7 and above
#    - Linux: x86 and x86_64 systems
#
# WINDOWS:
#   Download the Windows installer from https://install.meteor.com/windows
#
#   Meteor currently supports Windows 7, Windows 8.1, Windows Server 2008,
#   and Windows Server 2012.

# We wrap this whole script in a function, so that we won't execute
# until the entire script is downloaded.
# That's good because it prevents our output overlapping with curl's.
# It also means that we can't run a partially downloaded script.
# We don't indent because it would be really confusing with the heredocs.
run_it () {

# This always does a clean install of the latest version of Meteor into your
# ~/.meteor, replacing whatever is already there. (~/.meteor is only a cache of
# packages and package metadata; no personal persistent data is stored there.)

RELEASE="1.4.4.2"


# Now, on to the actual installer!

## NOTE sh NOT bash. This script should be POSIX sh only, since we don't
## know what shell the user has. Debian uses 'dash' for 'sh', for
## example.

PREFIX="/usr/local"

set -e
set -u

# Let's display everything on stderr.
exec 1>&2


UNAME=$(uname)
# Check to see if it starts with MINGW.
if [ "$UNAME" ">" "MINGW" -a "$UNAME" "<" "MINGX" ] ; then
    echo "To install Meteor on Windows, download the installer from:"
    echo "https://install.meteor.com/windows"
    exit 1
fi
if [ "$UNAME" != "Linux" -a "$UNAME" != "Darwin" ] ; then
    echo "Sorry, this OS is not supported yet via this installer."
    echo "For more details on supported platforms, see https://www.meteor.com/install"
    exit 1
fi


if [ "$UNAME" = "Darwin" ] ; then
  ### OSX ###
  if [ "i386" != "$(uname -p)" -o "1" != "$(sysctl -n hw.cpu64bit_capable 2>/dev/null || echo 0)" ] ; then
    # Can't just test uname -m = x86_64, because Snow Leopard can
    # return other values.
    echo "Only 64-bit Intel processors are supported at this time."
    exit 1
  fi

  # Running a version of Meteor older than 0.6.0 (April 2013)?
  if grep BUNDLE_VERSION /usr/local/bin/meteor >/dev/null 2>&1 ; then
    echo "You appear to have a very old version of Meteor installed."
    echo "Please remove it by running these commands:"
    echo "  $ sudo rm /usr/local/bin/meteor"
    echo "  $ sudo rm -rf /usr/local/meteor /usr/local/meteor.old"
    echo "and then run the installer command again:"
    echo "  $ curl https://install.meteor.com/ | sh"
    exit 1
  fi

  PLATFORM="os.osx.x86_64"
elif [ "$UNAME" = "Linux" ] ; then
  ### Linux ###
  LINUX_ARCH=$(uname -m)
  if [ "${LINUX_ARCH}" = "i686" ] ; then
    PLATFORM="os.linux.x86_32"
  elif [ "${LINUX_ARCH}" = "x86_64" ] ; then
    PLATFORM="os.linux.x86_64"
  else
    echo "Unusable architecture: ${LINUX_ARCH}"
    echo "Meteor only supports i686 and x86_64 for now."
    exit 1
  fi

  # Running a version of Meteor older than 0.6.0 (April 2013) on a dpkg system?
  if dpkg -s meteor >/dev/null 2>&1 ; then
    echo "You appear to have a very old version of Meteor installed."
    echo "Please remove it by running these commands:"
    echo "  $ sudo dpkg -r meteor"
    echo "  $ hash -r"
    echo "and then run the installer command again:"
    echo "  $ curl https://install.meteor.com/ | sh"
    exit 1
  fi

  # Running a version of Meteor older than 0.6.0 (April 2013) on an rpm system?
  if rpm -q meteor >/dev/null 2>&1 ; then
    echo "You appear to have a very old version of Meteor installed."
    echo "Please remove it by running these commands:"
    echo "  $ sudo rpm -e meteor"
    echo "  $ hash -r"
    echo "and then run the installer command again:"
    echo "  $ curl https://install.meteor.com/ | sh"
    exit 1
  fi
fi

trap "echo Installation failed." EXIT

if [ -z $HOME ] || [ ! -d $HOME ]; then
  echo "The installation and use of Meteor requires the \$HOME environment variable be set to a directory where its files can be installed."
  exit 1
fi

# If you already have a tropohouse/warehouse, we do a clean install here:
if [ -e "$HOME/.meteor" ]; then
  echo "Removing your existing Meteor installation."
  rm -rf "$HOME/.meteor"
fi

TARBALL_URL="https://meteorinstall-4168.kxcdn.com/packages-bootstrap/${RELEASE}/meteor-bootstrap-${PLATFORM}.tar.gz"
INSTALL_TMPDIR="$HOME/.meteor-install-tmp"
TARBALL_FILE="$HOME/.meteor-tarball-tmp"

cleanUp() {
  rm -rf "$TARBALL_FILE"
  rm -rf "$INSTALL_TMPDIR"
}

# Remove temporary files now in case they exist.
cleanUp

# Make sure cleanUp gets called if we exit abnormally.
trap cleanUp EXIT

mkdir "$INSTALL_TMPDIR"

# Only show progress bar animations if we have a tty
# (Prevents tons of console junk when installing within a pipe)
VERBOSITY="--silent";
if [ -t 1 ]; then
  VERBOSITY="--progress-bar"
fi

echo "Downloading Meteor distribution"
# keep trying to curl the file until it works (resuming where possible)
MAX_ATTEMPTS=10
RETRY_DELAY_SECS=5
set +e
ATTEMPTS=0
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]
do
  ATTEMPTS=$((ATTEMPTS + 1))

  curl $VERBOSITY --fail --continue-at - \
    "$TARBALL_URL" --output "$TARBALL_FILE"

  if [ $? -eq 0 ]
  then
      break
  fi

  echo "Retrying download in $RETRY_DELAY_SECS seconds..."
  sleep $RETRY_DELAY_SECS
done
set -e

# bomb out if it didn't work, eg no net
test -e "${TARBALL_FILE}"
bsdtar -xf "$TARBALL_FILE" -C "$INSTALL_TMPDIR"

test -x "${INSTALL_TMPDIR}/.meteor/meteor"
mv "${INSTALL_TMPDIR}/.meteor" "$HOME"
# just double-checking :)
test -x "$HOME/.meteor/meteor"

# The `trap cleanUp EXIT` line above won't actually fire after the exec
# call below, so call cleanUp manually.
cleanUp

echo
echo "Meteor ${RELEASE} has been installed in your home directory (~/.meteor)."

METEOR_SYMLINK_TARGET="$(readlink "$HOME/.meteor/meteor")"
METEOR_TOOL_DIRECTORY="$(dirname "$METEOR_SYMLINK_TARGET")"
LAUNCHER="$HOME/.meteor/$METEOR_TOOL_DIRECTORY/scripts/admin/launch-meteor"

if cp "$LAUNCHER" "$PREFIX/bin/meteor" >/dev/null 2>&1; then
  echo "Writing a launcher script to $PREFIX/bin/meteor for your convenience."
  cat <<"EOF"

To get started fast:

  $ meteor create ~/my_cool_app
  $ cd ~/my_cool_app
  $ meteor

Or see the docs at:

  docs.meteor.com

EOF
elif type sudo >/dev/null 2>&1; then
  echo "Writing a launcher script to $PREFIX/bin/meteor for your convenience."
  echo "This may prompt for your password."

  # New macs (10.9+) don't ship with /usr/local, however it is still in
  # the default PATH. We still install there, we just need to create the
  # directory first.
  # XXX this means that we can run sudo too many times. we should never
  #     run it more than once if it fails the first time
  if [ ! -d "$PREFIX/bin" ] ; then
      sudo mkdir -m 755 "$PREFIX" || true
      sudo mkdir -m 755 "$PREFIX/bin" || true
  fi

  if sudo cp "$LAUNCHER" "$PREFIX/bin/meteor"; then
    cat <<"EOF"

To get started fast:

  $ meteor create ~/my_cool_app
  $ cd ~/my_cool_app
  $ meteor

Or see the docs at:

  docs.meteor.com

EOF
  else
    cat <<EOF

Couldn't write the launcher script. Please either:

  (1) Run the following as root:
        cp "$LAUNCHER" /usr/bin/meteor
  (2) Add "\$HOME/.meteor" to your path, or
  (3) Rerun this command to try again.

Then to get started, take a look at 'meteor --help' or see the docs at
docs.meteor.com.
EOF
  fi
else
  cat <<EOF

Now you need to do one of the following:

  (1) Add "\$HOME/.meteor" to your path, or
  (2) Run this command as root:
        cp "$LAUNCHER" /usr/bin/meteor

Then to get started, take a look at 'meteor --help' or see the docs at
docs.meteor.com.
EOF
fi


trap - EXIT
}

run_it