#!/bin/sh
set -eu
cd "`dirname "$0"`"
[ -d pathofexile/dist ] || ./pathofexile/poeget.sh 
[ -d diablo2/dist ] || ./diablo2/d2get.sh 