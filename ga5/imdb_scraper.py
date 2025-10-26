import json
import re
import time
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import geckodriver_autoinstaller
from bs4 import BeautifulSoup

def scrape_imdb_with_firefox(min_rating=7.0, max_rating=8.0, count=25):
    """
    Scrapes IMDb using Selenium with Firefox to handle dynamic content.

    Args:
        min_rating (float): The minimum IMDb user rating.
        max_rating (float): The maximum IMDb user rating.
        count (int): The maximum number of titles to return.

    Returns:
        str: A JSON formatted string containing the movie data, or None.
    """
    # Configure Firefox options for headless operation
    firefox_options = FirefoxOptions()
    firefox_options.add_argument("--headless")
    firefox_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0")

    driver = None
    try:
        # Automatically install and set up geckodriver
        geckodriver_autoinstaller.install()
        
        driver = webdriver.Firefox(options=firefox_options)
        
        url = f"https://www.imdb.com/search/title/?user_rating={min_rating},{max_rating}"
        driver.get(url)

        # Wait for the page to load and try to accept cookies
        wait = WebDriverWait(driver, 20)
        try:
            # A more generic way to find consent buttons
            accept_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept')]")))
            accept_button.click()
        except Exception:
            pass # Continue if no button is found

        # Wait for a more generic list container to be present
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".ipc-metadata-list")))
        
        html_content = driver.page_source
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        movie_list = soup.find_all('li', class_='ipc-metadata-list-summary-item')
        if not movie_list:
            print("Could not find any movie items in the list.")
            return None

        extracted_data = []
        id_regex = re.compile(r'/title/(tt\d+)/')

        for item in movie_list[:count]:
            try:
                title_link = item.find('a', class_='ipc-title-link-wrapper')
                href = title_link['href']
                match = id_regex.search(href)
                imdb_id = match.group(1) if match else None

                title_text = title_link.find('h3').text
                title = re.sub(r'^\d+\.\s*', '', title_text).strip()

                metadata_div = item.find('div', class_='sc-b189961a-7')
                metadata_spans = metadata_div.find_all('span', class_='sc-b189961a-8')
                year = metadata_spans[0].text.strip() if len(metadata_spans) > 0 else None
                
                rating_span = item.find('span', class_='ipc-rating-star')
                rating = rating_span.text.split()[0].strip() if rating_span else None

                if all([imdb_id, title, year, rating]):
                    extracted_data.append({
                        "id": imdb_id,
                        "title": title,
                        "year": year,
                        "rating": rating
                    })
            except (AttributeError, IndexError):
                continue
        
        return json.dumps(extracted_data, indent=2)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    movie_data_json = scrape_imdb_with_firefox()
    if movie_data_json:
        print(movie_data_json)