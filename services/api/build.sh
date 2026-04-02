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

echo "Step 1: Upgrading pip in virtual environment..."
python -m pip install --upgrade pip setuptools wheel

echo "Step 2: Installing Python dependencies..."
# Install dependencies - Render's venv should handle this properly
python -m pip install --prefer-binary --no-cache-dir -r requirements-render.txt

echo "=== Build completed successfully! ==="

