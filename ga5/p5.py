
import requests
import json

def get_max_latitude(city: str, country: str):
    """
    Fetches geospatial data from the Nominatim API and returns the
    maximum latitude of the city's bounding box.

    Args:
        city (str): The name of the city.
        country (str): The name of the country.

    Returns:
        str: The maximum latitude as a string, or None if not found.
    """
    # Nominatim API endpoint
    url = "https://nominatim.openstreetmap.org/search"
    
    params = {
        'city': city,
        'country': country,
        'format': 'json'
    }
    
    # Nominatim requires a custom User-Agent header
    headers = {
        'User-Agent': 'UrbanRide Data Analytics (Gemini Agent)'
    }
    
    try:
        print(f"Fetching data for {city}, {country} from Nominatim API...")
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        results = response.json()
        
        if not results:
            print("Error: No results found for the specified city and country.")
            return None
            
        # The most relevant result is usually the first one.
        first_result = results[0]
        
        if 'boundingbox' not in first_result:
            print("Error: 'boundingbox' not found in the API response.")
            return None
            
        # The boundingbox is an array: [min_lat, max_lat, min_lon, max_lon]
        bounding_box = first_result['boundingbox']
        max_latitude = bounding_box[1]
        
        return max_latitude

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the API call: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing the API response: {e}")
        return None

# --- Main execution ---
if __name__ == "__main__":
    city_name = "Shanghai"
    country_name = "China"
    max_lat = get_max_latitude(city_name, country_name)
    
    if max_lat:
        print(f"\n--- Result ---")
        print(f"The maximum latitude of the bounding box for {city_name}, {country_name} is: {max_lat}")
        print(f"Value of the maximum latitude: {max_lat}")
