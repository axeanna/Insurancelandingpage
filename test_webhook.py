import urllib.request
import urllib.parse
from urllib.error import HTTPError, URLError

url = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec"

data = {
    "name": "Test User",
    "phone": "1234567890",
    "dob": "1990-01-01",
    "occupation": "Interested in life insurance products or riders",
    "smoker": "no",
    
    # PDF Variations
    "policy_pdf": "PDF_IS_HERE_1",
    "policy": "PDF_IS_HERE_2",
    "pdf": "PDF_IS_HERE_3",
    "file": "PDF_IS_HERE_4",
    "upload": "PDF_IS_HERE_5",
    "attachment": "PDF_IS_HERE_6",
    
    # Drag and Drop Variations
    "family_rank": "RANK_A_1",
    "Family": "RANK_A_2",
    "family": "RANK_A_3",
    "family_protection": "RANK_A_4",
    "q_family": "RANK_A_5",

    "income_rank": "RANK_B_1",
    "Income": "RANK_B_2",
    "income": "RANK_B_3",
    "income_replacement": "RANK_B_4",
    "q_income": "RANK_B_5",

    "accident_rank": "RANK_C_1",
    "Accident": "RANK_C_2",
    "accident": "RANK_C_3",
    "accident_coverage": "RANK_C_4",
    "q_accident": "RANK_C_5",

    "medical_rank": "RANK_D_1",
    "Medical": "RANK_D_2",
    "medical": "RANK_D_3",
    "medical_bills": "RANK_D_4",
    "q_medical": "RANK_D_5",

    "investment_rank": "RANK_E_1",
    "Investment": "RANK_E_2",
    "investment": "RANK_E_3",
    "investment_savings": "RANK_E_4",
    "q_invest": "RANK_E_5",
    
    # Array attempt
    "rankings[]": "ARRAY_1",
    "ranks[]": "ARRAY_2"
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
