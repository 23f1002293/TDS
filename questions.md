# Questions

Notes about questions

## Don't include both correlated questions in the same quiz

These questions are highly correlated.

- `src/q-sql-correlation.js` - `src/q-sql-regression.js`
- `src/q-llm-image-generation.js` - `src/q-llm-speech.js`
- `src/q-correlation-matrix.js` - `src/q-correlation-strength.js`
- `src/q-use-google-sheets.js` - `src/q-use-excel.js`

## Avoid easy questions except in GA1

These questions scored high in multiple quizzes:

- 94-95%: [Clean up student marks](src/q-clean-up-student-marks.js)
- 94-97%: [Import HTML to Google Sheets](src/q-google-sheets-importhtml.js)
- 94-96%: [GitHub Copilot Extension](src/q-github-copilot.js)
- 92-95%: [LLM Sentiment Analysis](src/q-llm-sentiment-analysis.js)
- 91-92%: [Use an Image Library in Google Colab](src/q-colab-image-library.js)
- 89-95%: [VS Code Version](src/q-vs-code-version.js)
- 89-94%: [Use Google Colab](src/q-use-colab.js) (1138 / 1211)
- 88-90%: [Least unique subjects from CSV](src/q-least-unique-subjects-from-csv.js)
- 87-88%: [Calculate correlation](src/q-calculate-correlation.js)
- 86-91%: [Embedding Similarity](src/q-embedding-similarity.js)
- 85-93%: [Extract nested JSON keys](src/q-extract-nested-json-keys.js)
- 83-94%: [LLM Embeddings](src/q-llm-embeddings.js)
- 70-92%: [Use Excel](src/q-use-excel.js)
- 76-94%: [Use Google Sheets](src/q-use-google-sheets.js)
- 76-91%: [Parse partial JSON](src/q-parse-partial-json.js)
- 75-91%: [Clean up sales data](src/q-clean-up-sales-data.js)

These questions scored high in a single quiz:

- 90%: [Create an Interactive Data Analysis with Marimo](src/q-marimo-notebook.js)
- 90%: [DuckDB: Multi-Table Correlation Analysis with Mixed DateTime Formats](src/q-duckdb-correlation-analysis.js)
- 90%: [E-commerce Analytics: Conversion Rate Factors](src/q-regression-strength.js)
- 90%: [SQL: E-learning Platform Correlation Analysis](src/q-sql-correlation.js)
- 90%: [SQL: Logistics Delivery Time Regression Analysis](src/q-sql-regression.js)
- 91%: [Manufacturing Analytics: Equipment Maintenance Costs](src/q-regression-fit.js)
- 91%: [Python: Service Request DateTime Pattern Analysis](src/q-python-datetime-analysis.js)
- 92%: [DuckDB: Customer Segmentation Analytics](src/q-duckdb-customer-segmentation.js)
- 93%: [Correlation Matrix: Marketing Analytics](src/q-correlation-matrix.js)
- 93%: [Excel: Geospatial Data Analysis](src/q-geospatial-excel-analysis.js)
- 93%: [HR Analytics: Employee Satisfaction Factors](src/q-correlation-strength.js)
- 93%: [Quality Control: Pharmaceutical Batch Outlier Detection](src/q-iqr.js)
- 93%: [Real Estate Analytics: Price Prediction](src/q-regression-pair.js)
- 93%: [Supply Chain Forecasting: Product Demand](src/q-forecast-linear.js)

# Unused questions

These questions are not used in any exam so far.

<!-- Run this command in src/ to find these:

comm -23 <(ls q-*.js | sort) <(grep -oh 'q-[^ ]*\.js' exam-*.js | sort | uniq)

-->

- [q-colab-drive-ingest.js](src/q-colab-drive-ingest.js)
- [q-colab-luma-threshold.js](src/q-colab-luma-threshold.js)
- [q-docker-metadata.js](src/q-docker-metadata.js)
- [q-fastapi-aggregation.js](src/q-fastapi-aggregation.js)
- [q-github-pages-csp.js](src/q-github-pages-csp.js)
- [q-google-auth-nonce.js](src/q-google-auth-nonce.js)
- [q-image-compression-manifest.js](src/q-image-compression-manifest.js)
- [q-ollama-route.js](src/q-ollama-route.js)
