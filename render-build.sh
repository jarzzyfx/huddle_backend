#!/usr/bin/env bash

# Install build tools for native modules
apt-get update && apt-get install -y build-essential python3
bun install
