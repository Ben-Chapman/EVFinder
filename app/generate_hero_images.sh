#!/bin/bash

###
# Simple helper script to generate various hero image renditions for The EV Finder
###

set -e

SOURCE_IMAGE_DIR="public/hero_images/src"
DESKTOP_IMAGE_DIR="public/hero_images"
BLURRED_IMAGE_DIR="public/hero_images/blurred"
MOBILE_IMAGE_DIR="public/hero_images/mobile"

DESKTOP_IMAGE_WIDTH="1280"
MOBILE_IMAGE_WIDTH="1024"

DESKTOP_QUALITY_FACTOR="80"
BLURRED_QUALITY_FACTOR="50"
MOBILE_QUALITY_FACTOR="60"

generate_desktop_images () {
  echo "Generating desktop image for $1"

  convert \
  -strip \
  -interlace Plane \
  -resize ${DESKTOP_IMAGE_WIDTH} \
  -density 96 \
  -quality "${DESKTOP_QUALITY_FACTOR}%" \
  ${1} ${2}

  # Optimizing the desktop images one by one. ImageOptim takes a single file or
  # a directory as input params, and when the input is a directory ImageOptim will
  # optimze all images recursively. Becuase the source images are stored in a 
  # subdir within the desktop images dir, the source images get optimized, which
  # we don't want.
  optimize_images $2
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
  -density 96 \
  -quality "${MOBILE_QUALITY_FACTOR}%" \
  ${1} ${2}
}

optimize_images () {
  if [ $(uname) = "Darwin" ]; then
    echo "Optimizing images: $@ 🚀"
    /Applications/ImageOptim.app/Contents/MacOS/ImageOptim ${@} > /dev/null 2>&1
  fi
}

main () {
  find -E ${SOURCE_IMAGE_DIR} -depth 1 -regex '.*(png|jpg|jpeg|webp)' -print |while read file; do
  echo -e "\n"
    IMAGE_NAME=$(basename ${file})
    generate_desktop_images ${file} ${DESKTOP_IMAGE_DIR}/${IMAGE_NAME}
    generate_blurred_images ${file} ${BLURRED_IMAGE_DIR}/${IMAGE_NAME}
    generate_mobile_images ${file} ${MOBILE_IMAGE_DIR}/${IMAGE_NAME}
  done
}

main

# Desktop images are optimized one by one in generate_desktop_images()
optimize_images ${BLURRED_IMAGE_DIR} ${MOBILE_IMAGE_DIR}