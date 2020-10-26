#!/usr/bin/env bash

set -e

BUILD_ID=${CIRCLE_BUILD_NUM:-${TRAVIS_JOB_NUMBER}}
echo "$BUILD_ID"
TEST_EXITCODE=0

npm run ganache-cli &
npm run serve &
echo 'sharing folder: ' $PWD '/apps/remix-ide/contracts' &
npm run remixd &

sleep 5

npx nx build remix-ide-e2e

TESTFILES=$(circleci tests glob "dist/apps/remix-ide-e2e/src/tests/**/*.test.js" | circleci tests split --split-by=timings)
for TESTFILE in $TESTFILES; do
    npx nx e2e remix-ide-e2e --filePath=$TESTFILE --env=firefox  || TEST_EXITCODE=1
done

echo "$TEST_EXITCODE"
if [ "$TEST_EXITCODE" -eq 1 ]
then
  exit 1
fi
