#!/bin/sh
set -eux
cd "`dirname "$0"`"
rm -rf dist
mkdir -p dist

export PATCH="`curl https://raw.githubusercontent.com/poe-tool-dev/latest-patch-version/main/latest.txt`"
cat config-template.json | envsubst '$PATCH' > config.json
pathofexile-dat