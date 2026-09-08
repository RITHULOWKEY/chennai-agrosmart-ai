import os
import requests

def agent3_weather(lat: float, long: float, crop_type: str) -> dict:
    """
    Monitor real-time weather and recommend water based on climate conditions.
    Fetches from OpenWeatherMap if OPENWEATHERMAP_API_KEY is present,
    otherwise uses mock data.
    """
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")
    
    # Default mock values
    temp = 32.0
    humidity = 45.0
    rain_24h = 0.0
    forecast = "Clear next 3 days"
    
    if api_key:
        try:
            # Example API call (current weather)
            url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={long}&appid={api_key}&units=metric"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                temp = data.get("main", {}).get("temp", temp)
                humidity = data.get("main", {}).get("humidity", humidity)
                rain_24h = data.get("rain", {}).get("1h", 0) * 24 # rough estimate for demo
                forecast = data.get("weather", [{}])[0].get("description", forecast)
        except Exception as e:
            print(f"Weather API error: {e}")
            pass

    water_adjustment = 1.0
    alert = "Normal weather conditions"

    # Build weather-based water model
    if temp > 35 and humidity < 40:
        water_adjustment += 0.20
        alert = "Very hot and dry - increase water by 20%"
    elif rain_24h > 10:
        water_adjustment -= 0.50
        alert = f"Rain expected ({rain_24h}mm) - reduce/skip watering"

    # Pest risk calculation
    if humidity > 80 and 25 <= temp <= 30:
        alert = "High fungal disease risk due to humidity and temp - monitor crop daily"

    return {
        "water_adjustment": round(water_adjustment, 2),
        "temp": temp,
        "humidity": humidity,
        "rain_24h": rain_24h,
        "alert": alert,
        "forecast": forecast,
        "confidence": 0.90 if api_key else 0.60
    }
