# github_ui_search
Simple web app to search github users and repositories using github APIs

To run the App:
- Make sure nodejs and express are installed
- Clone repository
- run npm start (or node server.js)
- Go to localhost:3000
- Search for users or repositories

Features:
- Uses github search api to fetch records related to the search string.
- Shows record in a paginated list of 5 per page.
- Navigate pages using Next / Previous buttons.
- Click on owner name / avatar or stargazers to open relevant page on github.