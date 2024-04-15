#!/bin/bash

###
# Simple helper script to generate various hero image renditions for The EV Finder
###

set -e

SOURCE_IMAGE_DIR="hero_source_images"
DESKTOP_IMAGE_DIR="public/hero_images"
BLURRED_IMAGE_DIR="public/hero_images/blurred"
MOBILE_IMAGE_DIR="public/hero_images/mobile"

DESKTOP_IMAGE_WIDTH="1920"
MOBILE_IMAGE_WIDTH="1280"

DESKTOP_QUALITY_FACTOR="80"
BLURRED_QUALITY_FACTOR="50"
MOBILE_QUALITY_FACTOR="80"

generate_desktop_images () {
  echo "Generating desktop image for $1"

  convert \
  -strip \
  -interlace Plane \
  -resize ${DESKTOP_IMAGE_WIDTH} \
  -density 96 \
  -quality "${DESKTOP_QUALITY_FACTOR}%" \
  ${1} ${2}
}

generate_blurred_images () {
  echo "Generating blurred image for $1"

  convert \
  -strip \
  -interlace Plane \
  -scale 10% \
  -blur 0x2.5 \
  -fill white \
  -colorize 40% \
  -resize ${DESKTOP_IMAGE_WIDTH} \
  -quality "${BLURRED_QUALITY_FACTOR}%" \
  ${1} ${2}
}

generate_mobile_images () {
  echo "Generating mobile image for $1"
  convert \
  -strip \
  -interlace Plane \
  -resize ${MOBILE_IMAGE_WIDTH} \
  -density 300 \
  -quality "${MOBILE_QUALITY_FACTOR}%" \
  ${1} ${2}
}

optimize_images () {
  if [ $(uname) = "Darwin" ]; then
    echo -e "\n🖼️ 🚀 Optimizing images: $@"

    /Applications/ImageOptim.app/Contents/MacOS/ImageOptim ${@} > /dev/null 2>&1
  fi
}

main () {
  # Removing existing hero image renditions, to be generated anew
  rm -rf ${DESKTOP_IMAGE_DIR}/*
  mkdir -p ${BLURRED_IMAGE_DIR} ${MOBILE_IMAGE_DIR}

  find -E ${SOURCE_IMAGE_DIR} -depth 1 -regex '.*(png|jpg|jpeg|webp)' -print |while read file; do
    echo ""
    IMAGE_NAME=$(basename ${file})
    # Use the source image to generate the desktop image
    generate_desktop_images ${file} ${DESKTOP_IMAGE_DIR}/${IMAGE_NAME}

    # Use the previously-optimized desktop image to generate the blurred and mobile images.
    generate_blurred_images ${DESKTOP_IMAGE_DIR}/${IMAGE_NAME} ${BLURRED_IMAGE_DIR}/${IMAGE_NAME} &
    generate_mobile_images ${DESKTOP_IMAGE_DIR}/${IMAGE_NAME} ${MOBILE_IMAGE_DIR}/${IMAGE_NAME} &
  done
}

main

# When testing locally, don't spend the time to optimize images.
if [[ $1 != "dev" ]]; then
  optimize_images ${DESKTOP_IMAGE_DIR}
fi
