
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup

# Initialize the FastAPI application
app = FastAPI(
    title="Wikipedia Outline API",
    description="An API to fetch the Markdown outline of a Wikipedia page for a given country.",
    version="1.0.0",
)

# Configure CORS (Cross-Origin Resource Sharing)
# This allows web pages from any domain to make requests to this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET"],  # Allow only GET requests
    allow_headers=["*"],  # Allow all headers
)

@app.get("/api/outline", response_class=PlainTextResponse)
async def get_country_outline(country: str):
    """
    Fetches the Wikipedia page for a country, extracts all headings,
    and returns them as a Markdown-formatted outline.
    """
    # Format the country name for the Wikipedia URL (e.g., "South Korea" -> "South_Korea")
    formatted_country = country.replace(" ", "_")
    url = f"https://en.wikipedia.org/wiki/{formatted_country}"

    headers = {
        'User-Agent': 'GlobalEdu Platforms Scraper (https://example.com/bot)'
    }

    try:
        # Fetch the HTML content of the page
        response = requests.get(url, headers=headers)
        # Raise an exception if the page wasn't found (e.g., 404 error)
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        raise HTTPException(status_code=404, detail=f"Wikipedia page for '{country}' not found.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching the page: {e}")

    # Parse the HTML using BeautifulSoup
    soup = BeautifulSoup(response.text, 'lxml')

    # Target the main content area of the page to avoid including headings
    # from the navigation, sidebar, or footer.
    content_div = soup.find(id="mw-content-text")
    if not content_div:
        raise HTTPException(status_code=500, detail="Could not find the main content area of the Wikipedia page.")

    # Find all heading tags (h1 to h6) within the main content
    headings = content_div.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

    markdown_outline = []
    for heading in headings:
        # The main page title is a h1 without the typical 'mw-headline' span
        if heading.name == 'h1':
            text = heading.get_text(strip=True)
        else:
            # For other headings, the text is usually within a span with this class.
            # This helps to exclude the "[edit]" links.
            headline = heading.find('span', class_='mw-headline')
            if headline:
                text = headline.get_text(strip=True)
            else:
                # Fallback for headings without the span
                text = heading.get_text(strip=True)

        if text:
            # Get the heading level from the tag name (e.g., 'h2' -> 2)
            level = int(heading.name[1])
            # Create the Markdown line (e.g., "## History")
            markdown_outline.append(f"{{'#' * level}} {text}")

    if not markdown_outline:
        raise HTTPException(status_code=404, detail=f"No headings found on the Wikipedia page for '{country}'.")

    return "\n\n".join(markdown_outline)

# To run this application, save it as main.py and run the following command in your terminal:
# uvicorn main:app --reload
