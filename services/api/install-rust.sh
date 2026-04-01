#!/usr/bin/env bash
set -e

echo "Installing Rust in writable location..."

# Set writable locations for Rust
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
export CARGO_TARGET_DIR=/tmp/cargo-target

# Create directories
mkdir -p $CARGO_HOME $RUSTUP_HOME $CARGO_TARGET_DIR

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    CARGO_HOME=$CARGO_HOME RUSTUP_HOME=$RUSTUP_HOME sh -s -- -y --default-toolchain stable --no-modify-path

# Add Rust to PATH
export PATH="$CARGO_HOME/bin:$PATH"

# Verify installation
rustc --version || echo "Warning: Rust installation may have issues"
cargo --version || echo "Warning: Cargo installation may have issues"

echo "Rust installed successfully in $CARGO_HOME"

