// Use puppeteer-extra to add plugins
const puppeteer = require('puppeteer-extra');
// Add the stealth plugin
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeImdbRatings(minRating = 7.0, maxRating = 8.0, count = 25) {
    let browser;
    try {
        console.log('Launching stealth browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const url = `https://www.imdb.com/search/title/?user_rating=${minRating},${maxRating}`;
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // A more generic selector that is more likely to be present
        const listSelector = "li.ipc-metadata-list-summary-item";
        console.log(`Waiting for selector: ${listSelector}`);
        await page.waitForSelector(listSelector, { timeout: 20000 });

        // Extract the data
        const movies = await page.evaluate((count) => {
            const results = [];
            const items = document.querySelectorAll("li.ipc-metadata-list-summary-item");
            
            for (let i = 0; i < items.length && i < count; i++) {
                const item = items[i];
                try {
                    const titleLink = item.querySelector('a.ipc-title-link-wrapper');
                    const titleText = titleLink.querySelector('h3.ipc-title__text').innerText || '';
                    const title = titleText.replace(/^\d+\.\s*/, '').trim();

                    const href = titleLink.getAttribute('href');
                    const idMatch = href.match(/\/title\/(tt\d+)\//);
                    const id = idMatch ? idMatch[1] : null;

                    const metadataItems = item.querySelectorAll('.sc-b189961a-8');
                    const year = metadataItems[0] ? metadataItems[0].innerText : null;
                    
                    const ratingElement = item.querySelector('span.ipc-rating-star');
                    const rating = ratingElement ? ratingElement.innerText.split(/\s/)[0] : null;

                    if (id && title && year && rating) {
                        results.push({ id, title, year, rating });
                    }
                } catch (e) {
                    // Ignore malformed items
                }
            }
            return results;
        }, count);

        return JSON.stringify(movies, null, 2);

    } catch (error) {
        console.error('An error occurred during scraping:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
}

// --- Main execution ---
(async () => {
    const movieDataJson = await scrapeImdbRatings();
    if (movieDataJson) {
        console.log(movieDataJson);
    }
})();