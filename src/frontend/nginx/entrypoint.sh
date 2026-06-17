#!/bin/sh
DIRECTORY="/etc/nginx/ssl"
CERTIF_FILE="$DIRECTORY/nginx-selfsigned.crt"
KEY_FILE="$DIRECTORY/nginx-selfsigned.key"

mkdir -p "$DIRECTORY"

if [ ! -f "$CERTIF_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERTIF_FILE" \
    -subj "/CN=$IP_ADD"
fi

exec nginx -g "daemon off;"