# Reddit Comments Sentiment Classifier
This project is a React-based frontend application designed to fetch and display Reddit posts, analyze the sentiment of the comment and provide related analytics. 

**Note**: It requires the backend service to be active (found at https://github.com/manogyaguragai/reddit_sentiment_classification_backend.git )

# HomePage Component

This project is a React-based frontend application designed to fetch, display, and analyze posts from Reddit using an API. It provides functionality to search for posts, fetch data from subreddits or post URLs, and view analytics based on sentiment analysis.

## Features

- **Fetch Data**: Collect Reddit posts from specific subreddits or URLs.
- **Search Posts**: Filter posts by title.
- **View Analytics**: Analyze sentiment trends and breakdowns.
- **Pagination**: Browse through posts with pagination.
- **Interactive Modals**: Fetch posts through modal-based input forms.

## Tech Stack

- **Frontend**: React
- **UI Library**: Ant Design
- **HTTP Client**: Axios
- **Routing**: React Router

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manogyaguragai/reddit_sentiment_classification_frontend.git
   cd <repository-folder>reddit_sentiment_classification_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start 
   ```
## Usage
1. Search Posts:
    - Use the search bar to filter posts by title.
2. Fetch Subreddit Posts:
    - Click the "+" button at the bottom-right corner and select "Fetch from subreddit."
    - Enter the subreddit name and post limit in the modal.
3. Fetch Posts by URL:
    - Click the "+" button at the bottom-right corner and select "Fetch from post URL."
    - Enter the post URL and fetch limit in the modal.
4. View Sentiment Analytics:
    - Analyze the trending sentiment for each post in the table.

## Contributing 
Contributions are welcome! Please fork this repository, make your changes, and submit a pull request.