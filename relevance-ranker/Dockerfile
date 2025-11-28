
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# 1. Install CPU-only PyTorch (Keeps image size small)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 2. Install AI libs, FastAPI, AND Uvicorn (The web server)
RUN pip install --no-cache-dir sentence-transformers numpy fastapi uvicorn pydantic

# Copy your code into the container
COPY main.py .

# 3. Expose the port (Optional but good practice)
EXPOSE 8000

# 4. START COMMAND (Crucial Change)
# "main:app" means "look in main.py for the variable named app"
# --host 0.0.0.0 is required for Docker to accept outside connections
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]