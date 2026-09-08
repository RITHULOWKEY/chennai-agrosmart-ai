import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agri_recommendation.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Farmer(Base):
    __tablename__ = "farmers"
    farmer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    location_lat = Column(Float)
    location_long = Column(Float)
    phone = Column(String)
    email = Column(String)

    fields = relationship("Field", back_populates="farmer")

class Field(Base):
    __tablename__ = "fields"
    field_id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.farmer_id"))
    soil_type = Column(String)
    crop_type = Column(String)
    planting_date = Column(Date)
    field_size_hectares = Column(Float)
    lat = Column(Float)
    long = Column(Float)
    field_polygon = Column(JSON) # Store GeoJSON Polygon for Phase 2

    farmer = relationship("Farmer", back_populates="fields")
    recommendations = relationship("Recommendation", back_populates="field")
    alerts = relationship("Alert", back_populates="field")

class Recommendation(Base):
    __tablename__ = "recommendations"
    rec_id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.field_id"))
    date_created = Column(DateTime, default=datetime.datetime.utcnow)
    irrigation_mm = Column(Float)
    irrigation_time = Column(String)
    irrigation_location_lat = Column(Float)
    irrigation_location_long = Column(Float)
    urgency = Column(String)
    harvest_day = Column(Integer)
    expected_price = Column(Float)
    expected_profit = Column(Float)

    field = relationship("Field", back_populates="recommendations")

class Alert(Base):
    __tablename__ = "alerts"
    alert_id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.field_id"))
    priority = Column(Integer) # 1: URGENT, 2: IMPORTANT, 3: INFO
    rule_name = Column(String)
    message = Column(String)
    action_recommended = Column(String)
    is_read = Column(Integer, default=0) # 0: unread, 1: read
    action_taken = Column(String, nullable=True) # e.g. "Watering skipped", "Pest spray applied"
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    field = relationship("Field", back_populates="alerts")

class EnvironmentalData(Base):
    __tablename__ = "environmental_data"
    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.field_id"))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    wind_speed = Column(Float, nullable=True)
    soil_moisture = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class WeatherHistory(Base):
    __tablename__ = "weather_history"
    weather_id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.field_id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    temp = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    forecast = Column(String)

class MarketPrice(Base):
    __tablename__ = "market_prices"
    price_id = Column(Integer, primary_key=True, index=True)
    crop_type = Column(String, index=True)
    date = Column(Date)
    price_per_quintal = Column(Float)
    market_name = Column(String)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.field_id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    agent_name = Column(String, index=True)
    recommendation = Column(JSON)
    confidence_score = Column(Float)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

