# Use AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY app/ ./app/

# Set Python path to include source directory
ENV PYTHONPATH="${LAMBDA_TASK_ROOT}/app:${PYTHONPATH}"

# Lambda handler
CMD ["app.main.handler"]