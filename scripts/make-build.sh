#!/bin/bash

build_mode=$1

if [ "$build_mode" = "production" ]; then
  npm run build:prod >/dev/null
else
	npm run build:dev >/dev/null
fi

cd dist
zip ../dist.zip * >/dev/null
cd ..
