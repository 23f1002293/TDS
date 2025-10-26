
import pandas as pd
import requests

def count_ducks_on_page(page_number):
    """
    Fetches ODI batting stats from a specific page on ESPN Cricinfo,
    and calculates the total number of ducks ('0' column).

    Args:
        page_number (int): The page number to fetch.

    Returns:
        int: The total number of ducks on that page, or None if an error occurs.
    """
    # Construct the URL for the specific page
    url = f"https://stats.espncricinfo.com/stats/engine/stats/index.html?class=2;page={page_number};template=results;type=batting"
    
    try:
        # Set a User-Agent header to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        
        # Fetch the content using requests
        response = requests.get(url, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        # pandas reads all tables from the HTML content into a list of DataFrames
        tables = pd.read_html(response.text)
        
        # As identified, the main player data is in the third table (index 2)
        # The first two tables are for navigation/summary
        stats_df = tables[2]
        
        # The column for ducks is named '0'
        ducks_column = '0'
        
        if ducks_column in stats_df.columns:
            # Convert the column to numeric, coercing errors to NaN (Not a Number)
            # This handles any non-numeric values gracefully
            numeric_ducks = pd.to_numeric(stats_df[ducks_column], errors='coerce')
            
            # Calculate the sum, ignoring NaN values
            total_ducks = numeric_ducks.sum()
            
            return int(total_ducks)
        else:
            print(f"Error: Column '{ducks_column}' not found in the table.")
            return None
            
    except ImportError:
        print("Error: The 'lxml' library is required. Please install it using 'pip install lxml'")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# --- Main execution ---
if __name__ == "__main__":
    target_page = 37
    total_ducks = count_ducks_on_page(target_page)
    
    if total_ducks is not None:
        print(f"The total number of ducks on page {target_page} is: {total_ducks}")

