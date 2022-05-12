#!/bin/bash

###
# Helper script to build The EVFinder Vue app
###

function git_stage() {
  FILE_TO_COMMIT=$1
  COMMIT_MESSAGE=$2
  git config --global user.email "cloudbuild@theevfinder.com"
  git config --global user.name "Cloud Build"
  git add ${FILE_TO_COMMIT}
  git commit -m ${COMMIT_MESSAGE}
}

function git_push() {
  git push https://${GITHUB_TOKEN}@github.com/Ben-Chapman/EVFinder.git main
}

# Install Node and NPM
/sbin/apk -U add nodejs=16.14.2-r0 npm

cd ./app
npm install

UPDATE_BROWSERSLIST=$(npx browserslist@latest --update-db --yes)

# Browserslist has been updated
if git status -s | grep 'package-lock.json' -eq 0; then
  INSTALLED_VER=$(echo $UPDATE_BROWSERSLIST |grep "Installed Version" |awk '{print $3}')
  LATEST_VER=$(echo $UPDATE_BROWSERSLIST |grep "Latest version" |awk '{print $3}')
  git_stage "package-lock.json" "Build: Update Browserslist from ${INSTALLED_VER} to ${LATEST_VER}"
fi

# Update the NPM package version from the git tag version
VER=$(echo $TAG_NAME |sed -e 's/v//g') # Removing v from tag name v1.x.x -> 1.x.x
npm version ${VER} -m "Build: Version bump to %s"
git_stage "package*" "Build: Version bump to ${VER}"

# Push changes to Github
git_push

# Now build
npm run build

if [ $? -eq 0 ]; then
  # App build was successful, so deploy to GCS
  gsutil -m -h "Cache-Control:public max-age=3600" cp -r /workspace/dist/* gs://${_APP_BUCKET_NAME}
  RETVAL=$?
fi

exit $RETVAL