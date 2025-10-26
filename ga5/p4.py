
import requests
import json
from datetime import date, timedelta

def generate_pseudo_forecast(location_id: int, num_days: int = 14):
    """
    Fetches a short-term forecast and uses the first day's description
    to generate a forecast structure for a specified number of days.

    Args:
        location_id (int): The BBC Weather location ID.
        num_days (int): The number of days to generate in the output.

    Returns:
        str: A JSON formatted string of the generated forecast, or None.
    """
    try:
        # --- Step 1: Fetch the available short-term forecast ---
        weather_url = f"https://weather-broker-cdn.api.bbci.co.uk/en/forecast/aggregated/{location_id}"
        print(f"Fetching short-term forecast from: {weather_url}")
        
        weather_response = requests.get(weather_url)
        weather_response.raise_for_status()
        forecast_data = weather_response.json()

        # --- Step 2: Extract the first day's description ---
        # Navigate the JSON to get the first report
        first_day_report = forecast_data['forecasts'][0]['detailed']['reports'][0]
        first_day_description = first_day_report.get('enhancedWeatherDescription')

        if not first_day_description:
            print("Error: Could not find the weather description in the API response.")
            return None
            
        print(f"Using description from first available day: '{first_day_description}'")

        # --- Step 3: Generate the 14-day forecast structure ---
        generated_forecast = {}
        # Use a fixed start date for reproducibility as requested
        start_date = date(2025, 10, 26) 

        for i in range(num_days):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")
            generated_forecast[date_str] = first_day_description
            
        return json.dumps(generated_forecast, indent=2)

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the API call: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing the API response. The structure may have changed: {e}")
        return None

# --- Main execution ---
if __name__ == "__main__":
    addis_ababa_id = 344979
    forecast_json = generate_pseudo_forecast(addis_ababa_id)
    if forecast_json:
        print("\n--- Generated 14-Day Weather Forecast for Addis Ababa ---")
        print(forecast_json)
