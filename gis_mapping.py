import folium
import geopandas as gpd
from shapely.geometry import shape
import geojson
from sqlalchemy.orm import Session
from database import Field, Recommendation, AgentLog

def generate_field_map(db: Session, field_id: int):
    """
    Generate an interactive Folium map for the given field.
    Returns the folium.Map object.
    """
    field = db.query(Field).filter(Field.field_id == field_id).first()
    if not field:
        raise ValueError("Field not found")

    # Center map on field or default to Chennai
    center_lat = field.lat if field.lat else 13.0827
    center_long = field.long if field.long else 80.2707
    
    m = folium.Map(location=[center_lat, center_long], zoom_start=15, tiles="OpenStreetMap")
    
    # 1. Field Boundary Layer
    if field.field_polygon:
        try:
            # Parse polygon (assuming it's stored as GeoJSON Feature or Geometry dict)
            geom = shape(field.field_polygon)
            gdf = gpd.GeoDataFrame(index=[0], crs="epsg:4326", geometry=[geom])
            
            folium.GeoJson(
                gdf,
                name="Field Boundary",
                style_function=lambda x: {'fillColor': 'blue', 'color': 'blue', 'weight': 2, 'fillOpacity': 0.1},
                tooltip=f"Field {field.field_id} - {field.field_size_hectares} ha"
            ).add_to(m)
        except Exception as e:
            print(f"Error rendering polygon: {e}")
            
    # 2. Soil Type Overlay
    soil_colors = {"clay": "brown", "loamy": "yellow", "sandy": "orange"}
    soil_color = soil_colors.get(field.soil_type.lower(), "gray")
    
    # We can add a simple circle marker to represent soil type if no polygon
    folium.CircleMarker(
        location=[center_lat, center_long],
        radius=50,
        color=soil_color,
        fill=True,
        fillColor=soil_color,
        fillOpacity=0.2,
        tooltip=f"Soil: {field.soil_type}",
        name="Soil Type Overlay"
    ).add_to(m)
    
    # Fetch latest recommendation
    latest_rec = db.query(Recommendation).filter(Recommendation.field_id == field_id)\
                   .order_by(Recommendation.date_created.desc()).first()
                   
    # 3. Water Need Indicator
    if latest_rec:
        water_need = latest_rec.irrigation_mm
        if water_need <= 20:
            water_color = "green"
        elif water_need <= 30:
            water_color = "yellow"
        else:
            water_color = "red"
            
        folium.Marker(
            location=[center_lat, center_long],
            icon=folium.Icon(color=water_color, icon="tint", prefix='fa'),
            tooltip=f"Water Need: {water_need}mm",
            popup=f"Watering Time: {latest_rec.irrigation_time}"
        ).add_to(m)
        
    # Fetch latest plant health log
    latest_health = db.query(AgentLog).filter(AgentLog.field_id == field_id, AgentLog.agent_name == 'plant_health')\
                      .order_by(AgentLog.date.desc()).first()
    
    # 4. Crop Health Indicator
    if latest_health:
        health_score = latest_health.recommendation.get("health_score", 0)
        health_color = "green" if health_score > 75 else "orange" if health_score > 50 else "red"
        
        folium.CircleMarker(
            location=[center_lat + 0.001, center_long + 0.001], # Offset slightly
            radius=10,
            color=health_color,
            fill=True,
            tooltip=f"Health Score: {health_score}",
            name="Crop Health"
        ).add_to(m)

    # 5. Weather Station Marker
    latest_weather = db.query(AgentLog).filter(AgentLog.field_id == field_id, AgentLog.agent_name == 'weather')\
                      .order_by(AgentLog.date.desc()).first()
    if latest_weather:
        weather_data = latest_weather.recommendation
        temp = weather_data.get("temp", "N/A")
        hum = weather_data.get("humidity", "N/A")
        
        folium.Marker(
            location=[center_lat - 0.002, center_long - 0.002],
            icon=folium.Icon(color="blue", icon="cloud"),
            tooltip=f"Weather Station",
            popup=f"Temp: {temp}°C, Humidity: {hum}%"
        ).add_to(m)

    folium.LayerControl().add_to(m)
    return m

def export_field_as_geojson(db: Session, field_id: int):
    """
    Export field and all agent data as GeoJSON.
    """
    field = db.query(Field).filter(Field.field_id == field_id).first()
    if not field:
        return None
        
    properties = {
        "field_id": field.field_id,
        "soil_type": field.soil_type,
        "crop_type": field.crop_type,
        "size_ha": field.field_size_hectares
    }
    
    # Add latest recommendation
    latest_rec = db.query(Recommendation).filter(Recommendation.field_id == field_id)\
                   .order_by(Recommendation.date_created.desc()).first()
    if latest_rec:
        properties["irrigation_mm"] = latest_rec.irrigation_mm
        
    if field.field_polygon:
        geom = shape(field.field_polygon)
    else:
        # Fallback to point
        from shapely.geometry import Point
        geom = Point(field.long, field.lat)
        
    feature = geojson.Feature(geometry=geom, properties=properties)
    return geojson.dumps(geojson.FeatureCollection([feature]))
