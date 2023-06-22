#!/bin/bash

###
# Helper script to build The EVFinder Vue app
###

function configure_git() {
  git config --global user.email "cloudbuild@theevfinder.com"
  git config --global user.name "Cloud Build"
}

function git_push() {
  git push https://${GITHUB_TOKEN}@github.com/Ben-Chapman/EVFinder.git HEAD:main
}

# The Node and NPM versions available through apk are old (v17.9.0). When using this
# version with the version of Webpack required for Vue JS 2, the build results in a SSL
# cypher error when building the app. To work around this, downloading and installing
# from source
NODE_VERSION=v18.16.1
NODE_PATH="node-${NODE_VERSION}-linux-x64"
curl -s "https://nodejs.org/dist/${NODE_VERSION}/${NODE_PATH}.tar.xz" | tar -xJf - -C /tmp
export PATH=/tmp/${NODE_PATH}/bin:$PATH

apk -U add gcompat

cd ./app
npm clean-install

# Setup git
configure_git

# Update the NPM package version from the git tag version
VER=$(echo $TAG_NAME |sed -e 's/v//g') # Removing v from tag name v1.x.x -> 1.x.x
npm version ${VER} -m "Build: Version bump to %s"
git commit -am "Build: Version bump to ${VER}"

# Push changes to Github
echo "Pushing changes to Github..."
git_push

# Now build
npm run build

if [ $? -eq 0 ]; then
  # App build was successful, so deploy to GCS
  # -z applies gzip compression to files with an extension matching the defined list
  gsutil -m -h "Cache-Control:public max-age=3600" \
  cp -r -z html,js,css,scss,xml,svg \
  /workspace/dist/* \
  gs://${_APP_BUCKET_NAME}

  # Don't cache index.html
  echo -e "\nSetting no-cache on index.html..."
  gsutil setmeta -h "Cache-Control:no-cache" gs://${_APP_BUCKET_NAME}/index.html
  RETVAL=$?

  # gsutil cp does not provide a way to exclude files from upload, so performing a
  # second operation to remove the hero images sources, as they're not publically
  # accessed
  echo -e "\nRemoving hero images source images..."
  gsutil -m rm -r gs://${_APP_BUCKET_NAME}/hero_images/src
fi

exit $RETVAL
