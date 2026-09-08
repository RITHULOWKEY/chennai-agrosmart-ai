def agent1_soil_recommendation(soil_type: str, crop_type: str, current_moisture: float) -> dict:
    """
    Analyze soil properties and recommend water quantity.
    In Phase 1, we use rule-based logic mapping soil types to characteristics.
    """
    soil_type = soil_type.lower()
    
    # Heuristic properties based on soil type
    soil_properties = {
        "clay": {"retention_factor": 0.40, "drainage_rate": 0.02},
        "loamy": {"retention_factor": 0.25, "drainage_rate": 0.05},
        "sandy": {"retention_factor": 0.10, "drainage_rate": 0.08}
    }
    
    # Default fallback
    props = soil_properties.get(soil_type, {"retention_factor": 0.20, "drainage_rate": 0.04})
    
    # Base requirement per crop type (in mm)
    crop_requirements = {
        "tomato": 30.0,
        "rice": 80.0,
        "wheat": 40.0
    }
    base_water = crop_requirements.get(crop_type.lower(), 25.0)
    
    # Water calculation: Base - (soil retention * current moisture)
    # We assume current_moisture is a percentage (0 to 100)
    adjusted_water = base_water - (props["retention_factor"] * current_moisture)
    adjusted_water = max(0, round(adjusted_water, 2))
    
    return {
        "mm_required": adjusted_water,
        "reason": f"{soil_type.capitalize()} soil retains moisture well. Base adjusted for retention.",
        "confidence": 0.85
    }
