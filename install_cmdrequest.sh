#!/bin/bash

mkdir -p ~/.mozilla/native-messaging-hosts
cat cmdrequest_native_manifest.json | sed -e "s|HOME_DIR|$HOME/.mozilla/native-messaging-hosts|g" > ~/.mozilla/native-messaging-hosts/cmdrequest.json
cp cmdrequest.py ~/.mozilla/native-messaging-hosts/cmdrequest.py
chmod 700 ~/.mozilla/native-messaging-hosts/cmdrequest.py