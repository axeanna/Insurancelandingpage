import urllib.request
import urllib.parse
import time
import json

url = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec"

leads = [
    {
        "name": "Ahmad bin Daud",
        "email": "ahmad.daud@gmail.com",
        "gender": "Male",
        "goal": "family",
        "annual_income": "96000",
        "housing": "2000",
        "car": "800",
        "bills": "500",
        "others": "300",
        "education": "400",
        "parents": "500",
        "years": "20",
        "life_cover": "2900000",
        "ci_cover": "270000",
        "source": "Life Cover Calculator",
        "occupation": "Engineer",
        "nature_of_business": "Technology",
        "smoker_status": "Non-Smoker",
        "medical_conditions": "None",
        "contact_preference": "Prefers personal consultation",
        "medical_card": "Yes",
        "annual_limit": "RM 2,000,000",
        "deductible": "RM 500"
    },
    {
        "name": "Sarah Lee",
        "email": "sarah.lee@gmail.com",
        "gender": "Female",
        "goal": "family",
        "annual_income": "150000",
        "housing": "3500",
        "car": "1200",
        "bills": "800",
        "others": "1000",
        "education": "0",
        "parents": "0",
        "years": "15",
        "life_cover": "3420000",
        "ci_cover": "390000",
        "source": "Life Cover Calculator",
        "occupation": "Teacher",
        "nature_of_business": "Education",
        "smoker_status": "Non-Smoker",
        "medical_conditions": "None",
        "contact_preference": "Email quotation only",
        "medical_card": "No",
        "annual_limit": "N/A",
        "deductible": "N/A"
    },
    {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@gmail.com",
        "gender": "Male",
        "goal": "family",
        "annual_income": "72000",
        "housing": "1500",
        "car": "500",
        "bills": "400",
        "others": "200",
        "education": "0",
        "parents": "600",
        "years": "10",
        "life_cover": "1104000",
        "ci_cover": "192000",
        "source": "Life Cover Calculator",
        "occupation": "Sales Manager",
        "nature_of_business": "Retail",
        "smoker_status": "Smoker",
        "medical_conditions": "High blood pressure",
        "contact_preference": "Prefers personal consultation",
        "medical_card": "Yes",
        "annual_limit": "RM 5,000,000",
        "deductible": "RM 1,000"
    }
]

print("Sending mock leads to Google Sheet...")
for i, lead in enumerate(leads):
    encoded_data = urllib.parse.urlencode(lead).encode('utf-8')
    req = urllib.request.Request(url, data=encoded_data, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Lead {i+1} ({lead['name']}) sent: Status {response.status}")
    except Exception as e:
        print(f"Error sending lead {i+1}: {e}")
    time.sleep(1) # wait a bit between requests to avoid rate limits

print("Done!")
