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

# Install Node and NPM
/sbin/apk -U add nodejs npm

cd ./app
npm install

echo "Updating Browserslist..."
UPDATE_BROWSERSLIST=$(npx browserslist@latest --update-db --yes)

# Setup git
configure_git

# Browserslist has been updated
git status -s | grep 'package-lock.json'
if [ $? -eq 0 ]; then
  INSTALLED_VER=$(echo $UPDATE_BROWSERSLIST |grep -i "Installed Version" |awk '{print $3}')
  LATEST_VER=$(echo $UPDATE_BROWSERSLIST |grep -i "Latest version" |awk '{print $3}')
  git commit -am "Build: Update Browserslist from ${INSTALLED_VER} to ${LATEST_VER}"
fi

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
  gsutil -m -h "Cache-Control:public max-age=3600" cp -r /workspace/dist/* gs://${_APP_BUCKET_NAME}
  RETVAL=$?
fi

exit $RETVAL