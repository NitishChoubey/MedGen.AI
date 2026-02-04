#!/usr/bin/env bash
set -e

echo "Installing Python dependencies..."

# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Set environment to prefer binary wheels and avoid Rust compilation issues
export PIP_PREFER_BINARY=1
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
mkdir -p $CARGO_HOME $RUSTUP_HOME

# Install dependencies with preference for binary wheels
pip install --prefer-binary --no-cache-dir -r requirements.txt

echo "Build completed successfully!"
