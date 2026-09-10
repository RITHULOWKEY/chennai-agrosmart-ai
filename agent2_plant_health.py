import base64
from io import BytesIO
from PIL import Image
import numpy as np

def _calculate_greenness_ratio(image: Image.Image) -> float:
    """
    Heuristic stand-in for a deep learning model (e.g. ResNet50).
    Calculates the ratio of 'green' pixels in the image.
    """
    img_np = np.array(image.convert('RGB'))
    r, g, b = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
    
    # Simple green pixel condition: G > R and G > B
    green_mask = (g > r) & (g > b)
    green_ratio = np.sum(green_mask) / (img_np.shape[0] * img_np.shape[1])
    return float(green_ratio)

def agent2_plant_health(image_base64: str, crop_type: str, days_since_planting: int) -> dict:
    """
    Analyze crop health from a base64 encoded photo and adjust water needs.
    """
    health_score = 75 # default assumption
    stress_level = "moderate"
    
    if image_base64:
        try:
            # Decode image
            image_data = base64.b64decode(image_base64)
            image = Image.open(BytesIO(image_data))
            image.thumbnail((256, 256)) # Resize for faster processing
            
            green_ratio = _calculate_greenness_ratio(image)
            # Map green ratio to health score (0-100)
            health_score = min(100, int(green_ratio * 150))
        except Exception as e:
            # Fallback if image is invalid
            print(f"Error processing image: {e}")
            pass
            
    # Determine stress level
    if health_score > 70:
        stress_level = "low"
        water_adjustment = 1.0
        reason = "Healthy crop - normal water needs"
    elif health_score > 40:
        stress_level = "moderate"
        water_adjustment = 0.85
        reason = "Moderate stress detected - reduce water by 15%"
    else:
        stress_level = "severe"
        water_adjustment = 0.70
        reason = "Severe stress detected - reduce water by 30%"
        
    # Crop stage tracking
    if days_since_planting < 15:
        stage = "seedling"
        water_adjustment *= 0.8
    elif days_since_planting < 45:
        stage = "vegetative"
    elif days_since_planting < 70:
        stage = "flowering"
        water_adjustment *= 1.1 # Needs more water
    else:
        stage = "fruiting"
        water_adjustment *= 0.9

    return {
        "water_adjustment": round(water_adjustment, 2),
        "health_score": health_score,
        "stress_level": stress_level,
        "stage": stage,
        "reason": reason,
        "confidence": 0.65  # Lower confidence since it's a heuristic
    }
