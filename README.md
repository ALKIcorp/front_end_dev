README (open README.md to see clean layout)

Project directory contents:

FRONT_END_DEV/
├── assets/                         # images, css, static bits
├── node_modules/                   # npm deps (auto)
│
│
<<<<<<< main
├── .env.local                      # (optional) local env vars — don't commit secrets
├── .gitignore                      # keeps node_modules and env files out of git
├── comment_on_latest.mjs           # add a comment on the most recent post
├── create_luna_post.mjs            # sample script: create a "Luna" demo post
├── create_post.mjs                 # create a post (caption + optional image url)
├── follow_user.mjs                 # follow a user by id/username
├── get_post_summary.mjs            # show a quick summary (counts, latest)
├── get_profile.mjs                 # fetch and print a user's profile
├── like_post.mjs                   # like a post by id
├── list_feed.mjs                   # list recent posts (general)
├── list_home_feed.mjs              # list home feed (people you follow + you)
├── list_posts.mjs                  # list posts by a specific author
├── onlycats_Gemini_base_file.html  # front-end UI (feed, create post, likes)
├── onlycats_supabase_playbook.docx # A→Z setup playbook for this project
├── package-lock.json               # npm lockfile (auto)
├── package.json                    # project metadata + scripts
├── README.md                       # this file
├── sign_in_test.mjs                # log in and insert a test post (RLS proof)
├── supabaseClient.mjs              # Supabase client (URL + anon key)
├── test_connection.mjs             # sanity: ping Supabase
├── unfollow_by_username.mjs        # unfollow a user by username
├── unlike_latest.mjs               # unlike your latest liked post
└── upload_image_post.mjs           # upload image to Storage + post (if used)
=======
├── get_profile.mjs                 - Script to fetch and display a user profile
├── onlycats_Gemini_base_file.html  - Base demo front-end HTML/CSS for OnlyCats
├── onlycats_supabase_playbook.docx - Supabase setup playbook (A-Z guide for project)
├── package-lock.json               - Auto-generated lockfile for npm dependencies
├── package.json                    - Project metadata + dependencies
├── supabaseClient.mjs              - Supabase client configuration (URL + anon key)
└── test_connection.mjs             - Script to test connection to Supabase

## Dev/Codex Workbench
Tracking GPT integration work on this branch.

>>>>>>> dev/codex
