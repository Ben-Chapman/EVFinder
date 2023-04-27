import google.cloud.logging

from flask import Blueprint, request
from google.cloud import error_reporting

logger = Blueprint(name="logger", import_name=__name__)

# Setup info level logging to GCP Cloud Logging
client = google.cloud.logging.Client()
gcp_logger = client.logger(name="evfinder")

# Setup error logging to GCP Error Reporting
error_client = error_reporting.Client()


@logger.route("/api/logger/error", methods=["POST"])
def send_gcp_error_message(errorMessage: str = ""):
    """A helper function which accepts an error log message and writes that message to
    GCP Error Reporting.

    This function can be called directly through send_gcp_error_message() which accepts
    one argument, a string containing the message to be logged.

    Keyword arguments:
    errorMessage -- the error message to be logged

    This is also exposed through Flask at /api/logger/error, which accepts a POST request
    containing a JSON body with the information to be logged. Regardless of logging
    success/failure a 200/OK is returned. This was designed to be fire and forget, so the
    actual response back to the caller isn't used.
    """
    if len(errorMessage) > 0:
        error_client.report(message=errorMessage)
    else:
        http_context = error_reporting.HTTPContext(
            user_agent=request.json["userAgent"],
            referrer=request.json["appVersion"],
        )
        error_client.report(
            message=request.json["errorMessage"],
            http_context=http_context,
        )
        return {"status": "OK"}


@logger.route("/api/logger/info", methods=["POST"])
def send_gcp_log_message(logMessage, severity="INFO"):
    """A helper function which accepts a non-error log message (INFO, WARN, DEBUG) and
    writes that message to GCP Cloud Logging.

    Keyword arguments:
    infoMessage -- the message to be logged
    severity -- the severity of the message. Can be one of DEBUG, INFO, NOTICE, WARNING,
    CRITICAL, ALERT, EMERGENCY
    """
    gcp_logger.log(
        logMessage,
        severity=severity,
    )
