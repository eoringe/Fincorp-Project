FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application code
COPY . .

# Railway sets PORT dynamically; default to 5000
ENV PORT=5000

EXPOSE ${PORT}

# Production WSGI server (gunicorn) instead of Flask dev server
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 120 app:app
