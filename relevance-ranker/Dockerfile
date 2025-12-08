FROM python:3.9-slim

# 1. Force logs to appear (Debugging)
ENV PYTHONUNBUFFERED=1

# 2. CRITICAL: Point AI Cache to /tmp (The only writable folder on Cloud Run)
ENV SENTENCE_TRANSFORMERS_HOME=/tmp
ENV TORCH_HOME=/tmp
ENV HF_HOME=/tmp

WORKDIR /app

# 3. Install dependencies
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir sentence-transformers numpy fastapi uvicorn pydantic

# 4. Copy the preload script and run it NOW (during the build)
# This bakes the model into the image so the app starts instantly
COPY preload.py .
RUN python preload.py

# 5. Copy the main app
COPY main.py .

# 6. Use Google Standard Port 8080
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]