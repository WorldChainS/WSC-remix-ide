#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run ganache-cli &
npm run serve &

sleep 5

npx nx build remix-ide-e2e
npm run nightwatch_local_runAndDeploy || TEST_EXITCODE=1

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
