import requests, json, os, datetime

long_line = "this is a very long line which is greater than the configured 88 characters, and should throw a pylint error"

def test_function():
  print(f"This is an f-string with no placeholders")

  try:
    2 + 2 == 4
  except Exception as e:
    print('Not doing anything with that exception variable.')