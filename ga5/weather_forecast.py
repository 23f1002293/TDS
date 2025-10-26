import json
import re
from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FirefoxOptions
import geckodriver_autoinstaller

def get_bbc_forecast_from_embedded_json():
    """
    Uses Selenium to load the BBC Weather page and extracts the full
    forecast data from an embedded JSON object within a script tag.
    """
    driver = None
    try:
        city_url = "https://www.bbc.co.uk/weather/344979" # Addis Ababa
        print(f"Loading page with Selenium to find embedded forecast data: {city_url}")

        firefox_options = FirefoxOptions()
        firefox_options.add_argument("--headless")
        firefox_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0")

        geckodriver_autoinstaller.install()
        driver = webdriver.Firefox(options=firefox_options)
        
        driver.get(city_url)
        
        # The forecast data is often stored in a __PRELOADED_STATE__ object
        # in a script tag. We will extract this entire JSON object.
        script_content = driver.execute_script(
            "return window.__PRELOADED_STATE__;"
        )

        if not script_content:
            print("Error: Could not find the __PRELOADED_STATE__ object on the page.")
            print("This indicates a change in the website structure or advanced bot detection.")
            return None

        # The structure is deeply nested. We need to navigate it carefully.
        # Based on inspection, the path is roughly:
        # core -> content -> sections -> ... -> forecast -> daily -> reports
        forecasts = None
        for section in script_content.get("core", {}).get("content", {}).get("sections", []):
            if section.get("id") == "daily":
                forecasts = section.get("forecast", {}).get("daily", {}).get("reports")
                break
        
        if not forecasts:
            print("Error: Could not find the daily forecast reports within the embedded JSON data.")
            return None

        transformed_forecast = {}
        for day_report in forecasts:
            local_date = day_report.get('localDate')
            description = day_report.get('enhancedWeatherDescription')
            if local_date and description:
                transformed_forecast[local_date] = description
        
        return json.dumps(transformed_forecast, indent=2)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
    finally:
        if driver:
            driver.quit()

# --- Main execution ---
if __name__ == "__main__":
    forecast_json = get_bbc_forecast_from_embedded_json()
    if forecast_json:
        print("\n--- Weather Forecast for Addis Ababa ---")
        print(forecast_json)