#!/usr/bin/env bash
set -e

echo "=== Starting Build Process ==="

# Display Python version
echo "Default Python version:"
python --version

# Check if Python 3.11 is available
if command -v python3.11 &> /dev/null; then
    echo "Found Python 3.11, using it..."
    alias python=python3.11
    alias pip=pip3.11
fi

python --version

echo "Step 1: Upgrading pip..."
pip install --upgrade pip setuptools wheel

echo "Step 2: Installing Python dependencies with pre-built wheels..."
# Prefer binary wheels to avoid Rust compilation issues
pip install --prefer-binary --no-cache-dir -r requirements-render.txt

echo "=== Build completed successfully! ==="
