#!/bin/sh
set -eu
dir=$(mktemp -d)
platform=$(uname -ms)
tgz="$dir/ezburn-$EZBURN_VERSION.tgz"

# Download the binary executable for the current platform
case $platform in
  'Darwin arm64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/darwin-arm64/-/darwin-arm64-$EZBURN_VERSION.tgz";;
  'Darwin x86_64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/darwin-x64/-/darwin-x64-$EZBURN_VERSION.tgz";;
  'Linux arm64' | 'Linux aarch64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/linux-arm64/-/linux-arm64-$EZBURN_VERSION.tgz";;
  'Linux x86_64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/linux-x64/-/linux-x64-$EZBURN_VERSION.tgz";;
  'NetBSD amd64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/netbsd-x64/-/netbsd-x64-$EZBURN_VERSION.tgz";;
  'OpenBSD arm64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/openbsd-arm64/-/openbsd-arm64-$EZBURN_VERSION.tgz";;
  'OpenBSD amd64') curl -fo "$tgz" "https://registry.npmjs.org/@ezburn/openbsd-x64/-/openbsd-x64-$EZBURN_VERSION.tgz";;
  *) echo "error: Unsupported platform: $platform"; exit 1
esac

# Extract the binary executable to the current directory
tar -xzf "$tgz" -C "$dir" package/bin/ezburn
mv "$dir/package/bin/ezburn" .
rm "$tgz"
