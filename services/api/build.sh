#!/usr/bin/env bash
set -e

echo "=== Starting Build Process ==="

# Display Python version
echo "Current Python version:"
python --version

# Try to use Python 3.11 if available by modifying PATH
if [ -f "/opt/python/cp311/bin/python3.11" ]; then
    echo "Found Python 3.11 at /opt/python/cp311/bin/python3.11"
    export PATH="/opt/python/cp311/bin:$PATH"
    export PYTHON="/opt/python/cp311/bin/python3.11"
elif command -v python3.11 &> /dev/null; then
    echo "Found Python 3.11 in PATH"
    export PYTHON="python3.11"
else
    echo "Python 3.11 not found, using default Python (may be 3.14+)"
    export PYTHON="python"
fi

echo "Using: $($PYTHON --version)"

echo "Step 1: Upgrading pip..."
$PYTHON -m pip install --upgrade pip setuptools wheel

echo "Step 2: Installing Python dependencies..."
# Use --only-binary for packages that should have wheels
# Allow source builds for packages without Python 3.14 wheels yet
$PYTHON -m pip install --prefer-binary --no-cache-dir -r requirements-render.txt

echo "=== Build completed successfully! ==="

