# OnlyCats API Scripts

This project provides a collection of Node.js scripts for interacting with the OnlyCats social media platform API. The scripts demonstrate how to perform common actions such as creating posts, following users, liking posts, and fetching data from the platform.

## Available Scripts

*   **`comment_on_latest.mjs`**: Adds a comment to the most recent post.
*   **`create_luna_post.mjs`**: A sample script that creates a demo post for the user "Luna".
*   **`create_post.mjs`**: Creates a new post with a caption and an optional image URL.
*   **`follow_user.mjs`**: Follows a user by their user ID or username.
*   **`get_post_summary.mjs`**: Displays a summary of a post, including like counts and the latest comments.
*   **`get_profile.mjs`**: Fetches and displays a user's profile information.
*   **`like_post.mjs`**: Likes a post by its ID.
*   **`list_feed.mjs`**: Lists the most recent posts from the general feed.
*   **`list_home_feed.mjs`**: Lists the posts from the home feed, which includes posts from users you follow.
*   **`list_posts.mjs`**: Lists all posts by a specific author.
*   **`sign_in_test.mjs`**: A script to test the sign-in functionality and create a test post.
*   **`supabaseClient.mjs`**: The Supabase client configuration for connecting to the OnlyCats API.
*   **`test_connection.mjs`**: A script to test the connection to the Supabase backend.
*   **`unfollow_by_username.mjs`**: Unfollows a user by their username.
*   **`unlike_latest.mjs`**: Unlikes the most recently liked post.
*   **`upload_image_post.mjs`**: Uploads an image and creates a new post with that image.

## Setup and Usage

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the root of the project and add the following environment variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    You can find these keys in your Supabase project settings.

3.  **Run Scripts:**
    You can run any of the scripts using `node`:
    ```bash
    node <script_name>.mjs
    ```
    For example, to create a new post:
    ```bash
    node create_post.mjs
