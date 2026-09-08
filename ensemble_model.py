def calculate_ensemble_recommendation(
    current_day: int,
    soil_data: dict,
    plant_health_data: dict,
    weather_data: dict,
    market_data: dict
) -> dict:
    """
    Aggregate 4 agent recommendations into a single best answer.
    """
    
    # Extract base water needed from soil agent (already in mm)
    base_water_mm = soil_data.get("mm_required", 25)
    
    # Extract adjustments
    adj_plant = plant_health_data.get("water_adjustment", 1.0)
    adj_weather = weather_data.get("water_adjustment", 1.0)
    
    # Market agent doesn't usually adjust water, but we can assume 1.0
    adj_market = 1.0
    
    # Calculate adjusted amounts
    adjusted_1 = base_water_mm
    adjusted_2 = base_water_mm * adj_plant
    adjusted_3 = base_water_mm * adj_weather
    adjusted_4 = base_water_mm * adj_market
    
    # Ensemble voting logic (Weighted Average)
    # Weights: Soil(0.3), Plant(0.25), Weather(0.25), Market(0.2)
    final_water_mm = (
        0.30 * adjusted_1 +
        0.25 * adjusted_2 +
        0.25 * adjusted_3 +
        0.20 * adjusted_4
    )
    final_water_mm = max(0, round(final_water_mm, 2))
    
    # Confidence scoring
    confidences = [
        soil_data.get("confidence", 0.7),
        plant_health_data.get("confidence", 0.7),
        weather_data.get("confidence", 0.7),
        market_data.get("confidence", 0.7)
    ]
    avg_confidence = round(sum(confidences) / len(confidences), 2)
    
    # Determine 'when' to water
    # If weather says rain, we might skip
    if weather_data.get("rain_24h", 0) > 10:
        when = f"Skip watering on Day {current_day} due to expected rain"
        final_water_mm = 0
    else:
        when = f"Day {current_day}, 6:00 AM"
    
    why_text = "Ensemble consensus of 4 agents"
    if avg_confidence < 0.7:
        why_text += " (Low confidence - manual review recommended)"
        
    return {
        "irrigation": {
            "when": when,
            "how_much_mm": final_water_mm,
            "why": why_text
        },
        "harvest": {
            "recommended_day": market_data.get("recommended_harvest_day", current_day + 30),
            "expected_price": market_data.get("predicted_price", 0),
            "profit_increase": market_data.get("profit_increase_vs_average", "0%")
        },
        "agent_breakdown": [
            {"agent": "soil", "recommendation_mm": base_water_mm, "confidence": soil_data.get("confidence")},
            {"agent": "plant_health", "adjustment": adj_plant, "confidence": plant_health_data.get("confidence")},
            {"agent": "weather", "adjustment": adj_weather, "confidence": weather_data.get("confidence")},
            {"agent": "market", "adjustment": adj_market, "confidence": market_data.get("confidence")}
        ],
        "alerts": [weather_data.get("alert"), plant_health_data.get("reason")]
    }
