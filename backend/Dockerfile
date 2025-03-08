# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies for Python and Akash CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libc-dev \
    libpq-dev \
    python3-dev \
    curl \
    ca-certificates \
    unzip \ 
    && rm -rf /var/lib/apt/lists/*

# Install Akash CLI
RUN curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh -s -- -b /usr/local/bin v0.6.1 \
    && akash version

# Copy and install Python dependencies
COPY requirements.txt .
COPY en_core_web_sm-3.7.1.tar.gz /tmp/en_core_web_sm-3.7.1.tar.gz
RUN pip install --user -r requirements.txt && \
    pip install --user /tmp/en_core_web_sm-3.7.1.tar.gz && \
    rm /tmp/en_core_web_sm-3.7.1.tar.gz

# Stage 2: Final image
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies (PostgreSQL, Akash CLI runtime deps, and minimal libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql \
    libpq5 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data/pgdata

# Copy Akash CLI from builder
COPY --from=builder /usr/local/bin/akash /usr/local/bin/akash

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Set environment variables
ENV PATH=/root/.local/bin:/usr/local/bin:$PATH \
    PGDATA=/data/pgdata \
    DATABASE_URL=postgresql+psycopg2://akash_user:akash_pass@localhost/akash_manager

# Initialize PostgreSQL database
RUN echo "postgres:5432:akash_manager:akash_user:akash_pass" > /root/.pgpass && \
    chmod 600 /root/.pgpass && \
    /usr/lib/postgresql/*/bin/initdb -D $PGDATA && \
    echo "host all all 0.0.0.0/0 md5" >> $PGDATA/pg_hba.conf && \
    echo "listen_addresses = '*'" >> $PGDATA/postgresql.conf

# Expose port
EXPOSE 5000

# Start PostgreSQL and Flask app
CMD ["/bin/sh", "-c", "/usr/lib/postgresql/*/bin/pg_ctl -D $PGDATA start && python app.py"]
