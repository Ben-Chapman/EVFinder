FROM python:3.10-slim

ENV APP_HOME /app
WORKDIR $APP_HOME
COPY requirements.txt .
COPY inventory_search.py main.py

# For Dev build
# COPY ./tests ./tests/

RUN pip3 install --no-cache-dir -r requirements.txt

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
# Timeout is set to 0 to disable the timeouts of the workers to allow Cloud Run to handle instance scaling.
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 main:app