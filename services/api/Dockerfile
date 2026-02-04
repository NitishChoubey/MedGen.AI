FROM python:3.11-slim

# Install system dependencies including Rust for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (required for sentencepiece and tokenizers)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
COPY runtime.txt .

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api/ ./api/

# Note: KB directory will be accessed via environment variable or mounted volume
# The KB path is set in the code to look for ../../kb/ relative to api/main.py
# which translates to /app/../../kb/ from WORKDIR /app
# For Render, you may need to set KB_DIR environment variable

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]

