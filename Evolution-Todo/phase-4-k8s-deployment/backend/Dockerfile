# Multi-stage production-ready Dockerfile for FastAPI backend using uv package manager
# Builder stage - installs dependencies
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy project files needed for dependency installation
COPY pyproject.toml uv.lock ./

# Sync dependencies using uv (production only, no dev dependencies)
RUN uv sync --frozen --no-dev

# Ensure essential tools like uvicorn and alembic are available in the virtual environment
RUN uv pip install --system "uvicorn[standard]>=0.40.0" "alembic>=1.17.2"

# Runtime stage - creates the final lightweight image
FROM python:3.11-slim AS runtime

# Set working directory
WORKDIR /app

# Install minimal OS packages required for production (PostgreSQL client libraries)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy application source code
COPY src/          ./src/
COPY alembic/      ./alembic/
COPY alembic.ini   ./

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose port for the application
EXPOSE 8000

# Healthcheck to verify the application is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Command to run the application: run migrations first, then start the server
CMD ["sh", "-c", "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4"]