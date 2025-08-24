# syntax=docker/dockerfile:1.7
# Base image with Python 3.11.5
FROM python:3.11.5-slim

# Avoid interactive tzdata
ENV DEBIAN_FRONTEND=noninteractive

# System deps: Java for VnCoreNLP + git + curl
RUN apt-get update \
     && apt-get install -y --no-install-recommends \
         openjdk-17-jre-headless \
         git \
         curl \
    bash \
         wget \
         ca-certificates \
     && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt ./

# Create a non-root user (optional but recommended)
RUN useradd -m -u 10001 appuser

# Python: no bytecode, UTF-8, and pip speedups
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Install Python deps
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt

# Copy app code
COPY app/ .

# Use project script to download VnCoreNLP assets into /app/tools/vncorenlp
RUN chmod +x scripts/download_vncorenlp_requirements.sh \
    && bash scripts/download_vncorenlp_requirements.sh

# # Environment hardening for TF to avoid XLA/PTX toolchain inside container
# ENV TF_CPP_MIN_LOG_LEVEL=2 \
#     TF_XLA_FLAGS="--tf_xla_auto_jit=0" \
#     XLA_FLAGS="--xla_gpu_enable_triton_gemm=false" \
#     TF_DISABLE_XLA=1 \
#     PRED_TF_USE_GPU=0

# Expose port
EXPOSE 8000

# Run as non-root
USER appuser

# Start API
CMD ["python3", "main.py"]
