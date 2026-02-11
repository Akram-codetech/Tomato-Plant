FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["gunicorn", "--workers=1", "--threads=2", "--timeout=120", "-b", "0.0.0.0:8000", "app:app"]


