from google.cloud import logging


class LoggingHelper:
    def __init__(self):
        # self.logging_client = logging.Client()
        self.logger = logging.Client().logger("api_logs")

    # def __enter__(self):
    #     self.loop = asyncio.get_running_loop()

    # def __exit__(self, exc_type, exc_value, traceback):
    #     asyncio.run(self)

    # @fire_and_forget
    def logit(self, log_data, severity):

        # https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
        severities = [
            "DEFAULT",
            "DEBUG",
            "INFO",
            "NOTICE",
            "WARNING",
            "ERROR",
            "CRITICAL",
            "ALERT",
            "EMERGENCY",
        ]

        if severity not in severities:
            severity = "DEFAULT"

        if type(log_data) == str:
            self.logger.log_text(log_data, severity=severity)

        if type(log_data) == dict:
            # await self.loop.run_in_executor(None, self.logger.log_struct(log_data))
            self.logger.log_struct(log_data)


# await loop.run_in_executor(
#         None, blocking_io)
