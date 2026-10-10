# Week 9 — Authenticated Blog API

This project extends the Week 8 Blog API with password hashing, JWT login, protected article endpoints, and article ownership authorization.

## Features

- Register and log in users with `bcrypt` password hashing and JWT authentication.
- Keep password hashes out of normal user queries and never return them from the API.
- Protect every article CRUD and search endpoint using `requireAuth`.
- Store a `userId` reference on each new article.
- Allow any authenticated user to read articles, while only the owner can update or delete an article.
- Preserve the Week 8 article validation, text search, database connection and existing `/articles` URL.
- Provide the new documented `/api/auth` and `/api/articles` routes, plus `/auth` and `/articles` compatibility aliases.

## Requirements

- Node.js 20.19+ (the project uses Mongoose 9).
- MongoDB / MongoDB Atlas.
- Postman for API testing.

## Setup

1. Open a terminal in the project folder.
2. Install dependencies (this also updates `package-lock.json` for the new dependencies):

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and enter your actual MongoDB URI and a strong, private JWT secret. Do not commit `.env`.

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   JWT_EXPIRES_IN=1d
   PORT=5000
   ```

   Use a long random secret rather than the example placeholder. Set the same required variable names in Render's environment settings.

4. Start the API:

   ```bash
   npm run dev
   ```

   Or use `npm start` for the production start command.

5. Visit `http://localhost:5000/`. The root endpoint returns a small health response.

## Authentication endpoints

### Register a user

`POST /api/auth/signup`

```json
{
  "name": "Ada Example",
  "email": "ada@example.com",
  "password": "StrongPass123!"
}
```

Successful response: `201 Created`, a safe user object and a JWT token. Passwords must be at least 8 characters. Email addresses are normalized to lowercase. Registering an existing email returns `409 Conflict`.

### Log in

`POST /api/auth/login`

```json
{
  "email": "ada@example.com",
  "password": "StrongPass123!"
}
```

Successful response: `200 OK`, a safe user object and a JWT token. Invalid credentials return `401 Unauthorized`.

## Article endpoints

Send this header with every article/search request:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/articles` | Create an article | Authenticated user; new article belongs to that user |
| GET | `/api/articles` | List articles | Any authenticated user |
| GET | `/api/articles/search?q=REST` | Text search | Any authenticated user |
| GET | `/api/articles/:id` | Get one article | Any authenticated user |
| PUT | `/api/articles/:id` | Update an article | Owner only |
| DELETE | `/api/articles/:id` | Delete an article | Owner only |

The original `/articles` endpoints remain available and enforce the same security middleware. The API assigns `author` and `userId` from the authenticated user. Client-supplied `author`/`userId` values are not accepted as ownership claims.

Create/update body:

```json
{
  "title": "Understanding API Authentication",
  "content": "This article explains how JWT authentication protects API endpoints from unauthorized access."
}
```

## Expected security responses

- `401 Unauthorized`: token missing, malformed, invalid or expired.
- `403 Forbidden`: a valid logged-in user attempts to update or delete another user's article.
- `404 Not Found`: the requested article ID does not exist.
- `400 Bad Request`: invalid ID or request validation fails.

Reading is authenticated but not owner-restricted; the assignment's ownership bonus restricts editing/deleting to the owner.

## Postman testing

Import `postman/Week9_Blog_API.postman_collection.json` into Postman. The collection defaults to `http://localhost:5000`; after deployment, change the collection variable `baseUrl` to your Render service URL. The collection registers two unique test users per run, logs each in, creates a post as User A, then checks missing-token and wrong-owner responses.

Recommended test order:

1. Sign up User A and log in; store token A.
2. Sign up User B and log in; store token B.
3. Create and read an article using token A.
4. Request articles without a token; expect `401`.
5. Try to update/delete A's article using token B; expect `403`.
6. Update/delete the article using token A; expect success.

## Assigning legacy Week 8 articles (optional)

Existing Week 8 articles may not yet have a `userId`. To keep them editable without allowing arbitrary users to claim them, first register/log in with the account that should own those existing articles, then set `LEGACY_ARTICLE_OWNER_EMAIL` to that account email in `.env` and run:

```bash
npm run migrate:legacy-articles
```

This command only assigns articles whose `userId` is missing/null; it does not reassign articles already owned by another user and does not delete records. Review the selected email before running it.

## Seeding sample articles

The seed command replaces the existing articles, as the original Week 8 seed script did. It now assigns the records to the earliest registered user so the ownership checks work. Register at least one user first, then run `npm run seed` only if you are comfortable replacing all article records in that database.

## Deploy to Render

1. Commit/push the updated files to the GitHub repository.
2. In the existing Render Web Service, deploy the latest commit.
3. In Render → Environment, set `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN` (for example `1d`). `PORT` is provided by Render if needed.
4. Deploy/restart the service and open the root URL.
5. Update Postman's `baseUrl` variable to the Render URL and rerun the authentication/ownership tests.

Do not put `.env`, passwords, MongoDB credentials, or JWT secrets in GitHub. `.env` is ignored by `.gitignore`.
