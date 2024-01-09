#!/bin/sh -eu

rm -rf dist
mkdir -p dist
# https://hellforge.vercel.app/v1
# https://hellforge.vercel.app/api/v1/graphql
curl 'https://hellforge.vercel.app/api/v1/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: https://hellforge.vercel.app' --data-binary '{"query":"{\n      getAutomagics {\n        Name\n        version\n        spawnable\n        rare\n        level\n        levelreq\n        frequency\n        group\n        mod1code\n        mod1min\n        mod1max\n        itype1\n        itype2\n      }\n}"}' --compressed \
    | jq '.' > dist/automagic.json
