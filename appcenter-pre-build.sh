#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env
printf "\n.env created with contents:\n\n"
cat .env
printf "\nDownloading whirlpool binary:\n"
curl --location https://github.com/bithyve/bitcoin-keeper/releases/download/v1.0.8/libwhirlpool.a --output ios/libwhirlpool.a
ls ios/