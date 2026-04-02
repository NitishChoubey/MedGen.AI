#!/usr/bin/env bash
set -e

echo "=== Starting Build Process ==="

# Activate Render's virtual environment
if [ -d "/opt/render/project/src/.venv" ]; then
    echo "Activating Render's virtual environment..."
    source /opt/render/project/src/.venv/bin/activate
fi

echo "Python version: $(python --version)"

echo "Step 1: Upgrading pip..."
python -m pip install --upgrade pip setuptools wheel

echo "Step 2: Installing dependencies (wheels only - no compilation)..."
python -m pip install --only-binary=:all: --no-cache-dir -r requirements-render.txt

echo "=== Build completed successfully! ==="

