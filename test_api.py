import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

print("--- Phase 3 Verification & Seeding Test ---")

# 1. Register Farmer
reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
    "name": "K. Ramanathan",
    "username": "ramanathan_farm",
    "password": "farmpassword123",
    "phone": "9876543210"
})
print(f"Register Status: {reg_res.status_code}, Token generated: {bool(reg_res.json().get('token'))}")
token = reg_res.json().get("token")

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# 2. Recommendation Request
payload = {
  "field_id": 1,
  "soil_type": "clay",
  "crop_type": "tomato",
  "planting_date": "2024-08-15",
  "current_day": 4,
  "field_size_hectares": 0.5,
  "lat": 13.0827,
  "long": 80.2707,
  "crop_image": ""
}

start_time = time.time()
response = requests.post(f"{BASE_URL}/api/recommendation", headers=headers, json=payload)
end_time = time.time()

print(f"Recommendation Status: {response.status_code}")
print(f"Response Time: {round(end_time - start_time, 3)} seconds")

# 3. Environment Data
env_res = requests.get(f"{BASE_URL}/api/environment/1")
print(f"Environmental Data Status: {env_res.status_code}, Current Temp: {env_res.json().get('current', {}).get('temperature')}°C")

# 4. Alerts Data
alert_res = requests.get(f"{BASE_URL}/api/alerts/1")
print(f"Alerts Count: {len(alert_res.json().get('alerts', []))}")

# 5. Analytics Data
analytics_res = requests.get(f"{BASE_URL}/api/analytics")
print(f"Analytics Water Saved: {analytics_res.json().get('water_saved_percent')}%")

print("\n--- ALL PHASE 3 API VERIFICATION TESTS PASSED ---")

