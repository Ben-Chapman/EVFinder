#!/bin/bash

gcloud run deploy api --source . --update-secrets=CLOUDFLARE_AUTH=Cloudflare-Auth-Token:latest
