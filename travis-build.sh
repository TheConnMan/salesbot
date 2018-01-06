docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
VERSION=`node -e "console.log(require('./package.json').version);"`;
if [ "$TRAVIS_BRANCH" != "master" ]; then
  sed -i "s/$VERSION/$VERSION-${TRAVIS_COMMIT}/g" package.json;
fi
docker build -t theconnman/salesbot .;
if [ "$TRAVIS_BRANCH" == "master" ]; then
  docker tag theconnman/salesbot theconnman/salesbot:$VERSION;
  docker push theconnman/salesbot:latest;
  docker push theconnman/salesbot:$VERSION;
elif [ "$TRAVIS_BRANCH" == "dev" ]; then
  docker tag theconnman/salesbot theconnman/salesbot:latest-dev;
  docker push theconnman/salesbot:latest-dev;
else
  docker tag theconnman/salesbot theconnman/salesbot:${TRAVIS_BRANCH#*/};
  docker push theconnman/salesbot:${TRAVIS_BRANCH#*/};
fi
