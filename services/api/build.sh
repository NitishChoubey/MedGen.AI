#!/usr/bin/env bash
set -e

echo "Installing Python dependencies..."

# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Set environment to use writable locations for Rust/Cargo (if needed)
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
export CARGO_TARGET_DIR=/tmp/cargo-target
mkdir -p $CARGO_HOME $RUSTUP_HOME $CARGO_TARGET_DIR

# Set pip to prefer binary wheels to avoid Rust compilation
export PIP_PREFER_BINARY=1
export PIP_ONLY_BINARY=:all:

# Try installing with pre-built wheels only first
echo "Attempting to install with pre-built wheels..."
if pip install --only-binary :all: --no-cache-dir -r requirements.txt 2>/dev/null; then
    echo "Successfully installed all packages from pre-built wheels!"
else
    echo "Some packages need compilation, installing Rust in writable location..."
    
    # Install Rust in writable location
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | CARGO_HOME=$CARGO_HOME RUSTUP_HOME=$RUSTUP_HOME sh -s -- -y --default-toolchain stable --no-modify-path
    export PATH="$CARGO_HOME/bin:$PATH"
    
    # Verify Rust installation
    rustc --version || echo "Rust installation failed, continuing anyway..."
    
    # Install dependencies (will compile if needed)
    pip install --prefer-binary --no-cache-dir -r requirements.txt
fi

echo "Build completed successfully!"
