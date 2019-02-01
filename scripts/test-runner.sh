#!/bin/sh

packageName=$1
karmaConfigFile="karma.conf.js"

node ./scripts/gen-karma-conf.js --package "$packageName" --out "$karmaConfigFile"
karma start "$karmaConfigFile"
rm "$karmaConfigFile"