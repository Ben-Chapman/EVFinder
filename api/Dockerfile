FROM python:3.10-slim

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY requirements.txt .
COPY ./* $APP_HOME/

RUN pip3 install --no-cache-dir -r requirements.txt

# Timeout is set to 0 to disable the timeouts of the workers to allow Cloud Run
# to handle instance scaling.
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 app:app