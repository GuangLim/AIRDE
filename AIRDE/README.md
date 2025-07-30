# AIRDE

## Project Setup

```sh
1.Install Dependencies
npm install
```

```sh
2.Create a .env file in the project root (not inside backend/):
VITE_SUMMARY_API=http://localhost:3000/summarize
COHERE_API_KEY=your-cohere-api-key
```

```sh
3.Start the Backend Server
cd backend
npm run dev
```

```sh
4.Start the Backend Server
cd ..
npm run dev
```

```sh
5. Visit Dev Server
Visit: http://localhost:5173
```
### Limitation
```sh
-Summary is limited by Cohere’s free quota, 
-AI summarize function need more than 250 words to generate the summary
-Free tier may return 429 (Too Many Requests) or quota errors when exceeded.
-currently fetches a fixed number of entries (e.g. 10–25); users cannot specify which data or filters (e.g., by drug name, date, or event type).
-only retrieves from one endpoint and does not support pagination or keyword search.
-UI not responsive 
-Simple layout and design
-cannot specify what kind of summary want, results depend entirely on how the AI interprets the input.
```

### Thought Process & Architecture
```sh
-Vue 3 chosen because of its beginner-friendly
-AI Integration via Cohere provide limited free trial
```

## Documentation of AI integration and regulatory data handling approach
```sh
 AI Integration: Cohere API

-urpose: Automatically generate a summary of multiple reult.
-Model Used: command model by Cohere, which is optimized for summarization and natural language generation.

Flow:
1.On the frontend, a user clicks the "Generate Summary" button.
2.The app collects relevant fields (e.g. safetyreportid, reactions, drugs, etc.) from each document.
3.This text is concatenated and sent as a POST request to a local backend API (/summarize).
4.The backend (server.js) reads the COHERE_API_KEY from the environment file.
5.It sends the text to Cohere’s /generate endpoint using the cohere-ai SDK.
6.The summarized result is returned and displayed above the document table.
```
```sh
Regulatory Data Handling

Source: FDA Adverse Event Reporting API
Endpoint Used: https://api.fda.gov/drug/event.json?limit=

Key Fields Used:
$safetyreportid — ID of the event
$receivedate / transmissiondate — Report timing
$serious, seriousnessdeath — Severity flags
$reactions — Recorded adverse effects
$drugs — Drug names involved
$reporter_country, companynumb — Metadata

Processing Logic:
-Each entry is parsed into a simplified readable string for summarization.
-Only fields with meaningful content are selected to avoid noise or token bloat.
-Data is displayed in a table with fields: Title, Date, Agency, Result, and the generated Summary.

Current Constraints:
The API query is fixed (no keyword filtering or dynamic input).
Only the first N entries (usually 10–25) are fetched to stay within summarization token limits.
```

