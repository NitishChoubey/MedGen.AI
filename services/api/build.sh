#!/usr/bin/env bash
set -e

echo "=== Starting Build Process ==="

# Set writable locations for Rust BEFORE anything else
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
export CARGO_TARGET_DIR=/tmp/cargo-target
export PATH="$CARGO_HOME/bin:$PATH"

# Create directories
mkdir -p $CARGO_HOME $RUSTUP_HOME $CARGO_TARGET_DIR

echo "Step 1: Installing Rust in writable location..."
# Install Rust FIRST, before pip tries to install anything
chmod +x install-rust.sh 2>/dev/null || true
if [ -f install-rust.sh ]; then
    ./install-rust.sh
else
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
        CARGO_HOME=$CARGO_HOME RUSTUP_HOME=$RUSTUP_HOME sh -s -- -y --default-toolchain stable --no-modify-path
    export PATH="$CARGO_HOME/bin:$PATH"
fi

# Verify Rust is available
rustc --version || echo "Warning: Rust may not be in PATH"
cargo --version || echo "Warning: Cargo may not be in PATH"

echo "Step 2: Upgrading pip..."
pip install --upgrade pip setuptools wheel

echo "Step 3: Installing Python dependencies..."
# Set pip to prefer binary wheels, but allow compilation if needed
export PIP_PREFER_BINARY=1

# Install dependencies - Rust is now available in writable location
pip install --prefer-binary --no-cache-dir -r requirements.txt

echo "=== Build completed successfully! ==="
