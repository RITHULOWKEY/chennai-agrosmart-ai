import os
import datetime
from sqlalchemy.orm import Session
from database import Alert, Field, Recommendation, EnvironmentalData, WeatherHistory, MarketPrice

# Toggle between mock logging and Twilio
ENABLE_TWILIO_SMS = os.getenv("ENABLE_TWILIO_SMS", "false").lower() == "true"
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

def send_notification(phone: str, message: str):
    """Sends notification via Twilio SMS or fallback to console log."""
    if ENABLE_TWILIO_SMS and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            print(f"[TWILIO SMS SENT to {phone}]: {message}")
            return
        except Exception as e:
            print(f"[TWILIO SMS FAILED]: {e}. Falling back to console log.")

    # Mock delivery log
    print(f"[NOTIFICATION SENT to {phone or 'Farmer'}]: {message}")

def check_all_alerts(db: Session, field_id: int):
    """
    Evaluates 7 rule sets against weather forecasts, soil moisture, and market trends,
    generating prioritized alerts.
    """
    field = db.query(Field).filter(Field.field_id == field_id).first()
    if not field:
        return []

    latest_rec = db.query(Recommendation).filter(Recommendation.field_id == field_id).order_by(Recommendation.date_created.desc()).first()
    latest_env = db.query(EnvironmentalData).filter(EnvironmentalData.field_id == field_id).order_by(EnvironmentalData.timestamp.desc()).first()
    weather = db.query(WeatherHistory).filter(WeatherHistory.field_id == field_id).order_by(WeatherHistory.date.desc()).first()

    temp = latest_env.temperature if latest_env else (weather.temp if weather else 32.0)
    humidity = latest_env.humidity if latest_env else (weather.humidity if weather else 65.0)
    rainfall = latest_env.rainfall if latest_env else (weather.rainfall if weather else 0.0)

    generated_alerts = []

    # Helper to insert alert if not duplicated within last 24h
    def add_alert(priority: int, rule_name: str, message: str, action: str):
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
        existing = db.query(Alert).filter(
            Alert.field_id == field_id,
            Alert.rule_name == rule_name,
            Alert.timestamp >= cutoff
        ).first()

        if not existing:
            alert = Alert(
                field_id=field_id,
                priority=priority,
                rule_name=rule_name,
                message=message,
                action_recommended=action,
                is_read=0
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)

            # Send Notification
            farmer_phone = field.farmer.phone if field.farmer else None
            send_notification(farmer_phone, f"[{'URGENT' if priority==1 else 'ALERT'}] Field #{field_id}: {message}")

            generated_alerts.append(alert)

    # Rule 1: Heavy rain tomorrow → Skip irrigation
    if rainfall > 40.0:
        add_alert(
            priority=1,
            rule_name="heavy_rain",
            message=f"Heavy rain expected tomorrow ({rainfall:.1f}mm) - SKIP watering.",
            action="Override irrigation recommendation to 0mm"
        )

    # Rule 2: Extreme heat → Increase water
    if temp > 38.0 and humidity < 40.0:
        add_alert(
            priority=1,
            rule_name="extreme_heat",
            message=f"Extreme heat expected ({temp:.1f}°C) with low humidity - Increase water by 15%.",
            action="Increase irrigation recommendation by 15%"
        )

    # Rule 3: Fungal disease risk → Monitor crop
    if humidity > 85.0 and (20.0 <= temp <= 28.0):
        add_alert(
            priority=2,
            rule_name="fungal_risk",
            message="High fungal disease risk detected (high humidity & moderate temp). Monitor crop for yellow spots.",
            action="Apply organic fungicide or increase canopy airflow"
        )

    # Rule 4: Pest risk (whitefly/aphid)
    if temp > 30.0 and humidity > 70.0:
        add_alert(
            priority=2,
            rule_name="pest_risk",
            message="Whitefly/aphid outbreak risk high due to warm humid conditions.",
            action="Scout crop and schedule eco-friendly pest control spray"
        )

    # Rule 5: Soil moisture imbalance / drought
    if latest_env and latest_env.soil_moisture is not None and latest_env.soil_moisture < 20.0:
        add_alert(
            priority=1,
            rule_name="soil_drought",
            message="Soil moisture critically low (<20%). Irrigation urgent to prevent root damage.",
            action="Immediate watering recommended"
        )

    # Rule 6: Harvest window closing
    if latest_rec and latest_rec.harvest_day is not None and latest_rec.harvest_day <= 5:
        add_alert(
            priority=2,
            rule_name="harvest_window",
            message=f"Harvest window in {latest_rec.harvest_day} days. Predicted price ₹{latest_rec.expected_price:,.0f}/quintal.",
            action="Prepare harvest equipment and labor"
        )

    # Rule 7: Market price peak
    if latest_rec and latest_rec.expected_price and latest_rec.expected_price > 3500:
        add_alert(
            priority=3,
            rule_name="market_peak",
            message=f"Optimal harvest price peak! Current predicted price ₹{latest_rec.expected_price:,.0f} (above average).",
            action="Prioritize crop harvesting to maximize revenue"
        )

    return generated_alerts
