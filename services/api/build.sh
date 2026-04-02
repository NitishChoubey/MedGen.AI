#!/usr/bin/env bash
set -e

echo "=== Starting Build Process ==="

# Render creates a venv at /opt/render/project/src/.venv
# We need to activate it and use it
if [ -d "/opt/render/project/src/.venv" ]; then
    echo "Activating Render's virtual environment..."
    source /opt/render/project/src/.venv/bin/activate
fi

# Display current Python version
echo "Current Python version:"
python --version

# Set up writable Rust directories in case any package needs compilation
export CARGO_HOME=/tmp/cargo
export RUSTUP_HOME=/tmp/rustup
export CARGO_TARGET_DIR=/tmp/cargo-target
mkdir -p $CARGO_HOME $RUSTUP_HOME $CARGO_TARGET_DIR

echo "Step 1: Upgrading pip in virtual environment..."
python -m pip install --upgrade pip setuptools wheel

echo "Step 2: Installing Python dependencies (preferring pre-built wheels)..."
# Try to install with pre-built wheels only first
if python -m pip install --only-binary=:all: --no-cache-dir -r requirements-render.txt 2>/dev/null; then
    echo "✓ All packages installed from pre-built wheels"
else
    echo "Some packages need compilation, installing Rust..."
    
    # Install Rust to writable location
    if ! command -v rustc &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
            CARGO_HOME=$CARGO_HOME RUSTUP_HOME=$RUSTUP_HOME \
            sh -s -- -y --default-toolchain stable --no-modify-path
        export PATH="$CARGO_HOME/bin:$PATH"
    fi
    
    # Retry installation allowing source builds
    python -m pip install --prefer-binary --no-cache-dir -r requirements-render.txt
fi

echo "=== Build completed successfully! ==="

