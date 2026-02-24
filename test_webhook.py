import urllib.request
import urllib.parse
from urllib.error import HTTPError, URLError

url = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec"

data = {
    "name": "Test User",
    "phone": "1234567890",
    "dob": "1990-01-01",
    "topic": "Interested in life insurance products or riders",
    "smoker": "no",
    "policy_pdf": "",
    "Family": "1",
    "Income": "2",
    "Accident": "3",
    "Medical": "4",
    "Investment": "5"
}

encoded_data = urllib.parse.urlencode(data).encode('utf-8')

req = urllib.request.Request(url, data=encoded_data, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status code:", response.status)
        print("Response body:", response.read().decode('utf-8'))
except HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
    print("Response body:", e.read().decode('utf-8'))
except URLError as e:
    print(f"URL Error: {e.reason}")
