#!/bin/bash

gcloud config set project evfinder && \
gcloud run deploy api --source . --update-secrets=CLOUDFLARE_AUTH=Cloudflare-Auth-Token:latest
