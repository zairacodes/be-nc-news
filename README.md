# Northcoders News API

Hello there!

Thank you for your interest in my first back-end project.

You can explore the hosted version of the API [here](https://be-nc-news-6djf.onrender.com/api/).  
Please note that since this project is on a free plan, there may be delays of 50 seconds or more due to inactivity causing the server to spin down. Thanks for your patience.

## Overview

The Northcoders News API serves as a platform for accessing and interacting with various articles, topics, comments and users, aiming to mimic a real-world backend service like [Reddit](https://www.reddit.com/).  
This API serves as the backend for the NC News application, handling all server-side logic and database management. You can explore the front-end project [here](https://github.com/zairacodes/nc-news/) and the deployed app [here](https://ncnews-zaira.netlify.app/).

## Tech Stack

- **Testing**: Jest, Supertest (TDD)
- **Backend**: Express
- **Database**: PostgreSQL
- **Hosting**: Supabase (DB), Render (API)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/package-manager/): v21.7.2 or above
- [PostgreSQL](https://www.postgresql.org/download/): v14.11 or above

### Installing

To run the project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/zairacodes/be-nc-news.git
   cd be-nc-news
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up the environment variables**:

   - Create two `.env` files in root directory: `.env.test` and `.env.development`.
   - In each file, add `PGDATABASE=` followed by the correct database name for that environment. Please refer to `/db/setup.sql` for the correct database names.
   - Please make sure the `.env` files are added to `.gitignore`.

4. **Set up the local databases**:

   ```bash
   npm run setup-dbs
   ```

5. **Seed the local development database**:

   ```bash
   npm run seed
   ```

6. **Run the tests**:

   ```bash
   npm test
   ```

7. **Start the server**:

   ```bash
   npm start
   ```

## Useful Links

- [API](https://be-nc-news-6djf.onrender.com/api/)
- [Front-end Project](https://github.com/zairacodes/nc-news/)
- [Front-end Application](https://ncnews-zaira.netlify.app/)

Feel free to reach out if you have any questions or feedback!

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

[![Made with ♥ by Zaira](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%20by-Zaira-red)](https://www.linkedin.com/in/zaira-n/)
