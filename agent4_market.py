def agent4_market(crop_type: str, planting_date: str, field_size_hectares: float) -> dict:
    """
    Analyze crop prices and recommend optimal harvest timing.
    In Phase 1, uses historical seasonal mock data.
    """
    crop_type = crop_type.lower()
    
    # Expected yield per hectare in quintals (100kg)
    yield_per_ha = {
        "tomato": 400.0, # 40 tons
        "rice": 60.0,
        "wheat": 50.0
    }
    
    # Historical average price per quintal in INR
    avg_price = {
        "tomato": 3000.0,
        "rice": 2500.0,
        "wheat": 2200.0
    }
    
    expected_yield = yield_per_ha.get(crop_type, 100.0) * field_size_hectares
    base_price = avg_price.get(crop_type, 2000.0)
    
    # Mock prediction: assume price goes up by 15% due to seasonal peak 
    # slightly after expected maturity
    predicted_price = base_price * 1.15
    
    # Recommend harvest day (mock logic based on crop)
    maturity_days = {
        "tomato": 90,
        "rice": 120,
        "wheat": 110
    }
    recommended_harvest_day = maturity_days.get(crop_type, 100) + 4 # 4 days after maturity is peak price
    
    expected_profit = expected_yield * predicted_price
    avg_profit = expected_yield * base_price
    
    profit_increase_pct = ((expected_profit - avg_profit) / avg_profit) * 100
    
    return {
        "recommended_harvest_day": recommended_harvest_day,
        "predicted_price": round(predicted_price, 2),
        "expected_yield": round(expected_yield, 2), # in quintals
        "expected_profit_per_hectare": round(expected_profit / field_size_hectares, 2),
        "profit_increase_vs_average": f"{round(profit_increase_pct, 1)}%",
        "reason": "Price predicted to peak shortly after maturity based on seasonal demand patterns",
        "confidence": 0.88
    }
