# HTTP Server – User CRUD API

A PBKK assignment: a simple REST API for managing users. Built with Node.js's built-in `node:http` module (no framework), TypeScript, and SQLite (`better-sqlite3`).

## Tech Stack

- **Node.js + TypeScript**: the server uses `node:http` directly
- **better-sqlite3**: data is stored in the `users.db` file
- **tsx**: runs TypeScript files without a build step
- **Vitest + Supertest**: endpoint testing

## Project Structure

```
h01/
├── src/
│   ├── index.ts         # Entry point, starts the server on port 3000
│   ├── server.ts        # Routing, validation, and database access
│   └── server.test.ts   # Tests for every endpoint
├── package.json
└── tsconfig.json
```

The `users.db` file is created automatically the first time the server starts.

## Installation

```bash
pnpm install
```

## Running the Server

```bash
npx tsx src/index.ts
```

The server runs at `http://localhost:3000`.

## Running the Tests

```bash
npx vitest run
```

> **Warning:** the tests use the same `users.db` file as the server, and every test clears the `users` table. Any data added through the server will be lost after the tests run.

## Endpoints

| Method  | Path         | Description         | Success |
| ------- | ------------ | ------------------- | ------- |
| GET     | `/users`     | Get all users       | 200     |
| GET     | `/users/:id` | Get a single user   | 200     |
| POST    | `/users`     | Create a new user   | 201     |
| PUT     | `/users/:id` | Update a user       | 200     |
| DELETE  | `/users/:id` | Delete a user       | 200     |
| OPTIONS | any path     | CORS preflight      | 200     |

Every response uses `Content-Type: application/json` and includes these CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
```

### User Object

```json
{
  "id": 1,
  "name": "John Doe",
  "age": 25,
  "isAdmin": false,
  "createdAt": "2026-11-09T08:00:00.000Z",
  "updatedAt": "2026-11-09T08:00:00.000Z"
}
```

`id`, `createdAt`, and `updatedAt` are set by the server. On update, `id` and `createdAt` stay the same while `updatedAt` is refreshed.

### Example Requests

**Create a user**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 25, "isAdmin": false}'
```

**Update a user**

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "age": 26, "isAdmin": true}'
```

**Delete a user**

```bash
curl -X DELETE http://localhost:3000/users/1
```

Response:

```json
{
  "message": "User deleted",
  "user": { "id": 1, "name": "John Updated", "age": 26, "isAdmin": true, "...": "..." }
}
```

## Validation Rules (POST & PUT)

| Field     | Rule                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| `name`    | Required, string, not empty, at most 100 characters. Leading and trailing spaces are trimmed. |
| `age`     | Required, integer from 0 to 150                                                       |
| `isAdmin` | Optional, must be a boolean. Defaults to `false`                                      |

If validation fails, the server responds with `400` and a list of error messages:

```json
{
  "error": "Validation failed",
  "details": ["Age must be a valid integer between 0 and 150"]
}
```

## Error Responses

| Status | Body                                    | Cause                                   |
| ------ | --------------------------------------- | --------------------------------------- |
| 400    | `{ "error": "Invalid JSON" }`           | Body is not valid JSON                  |
| 400    | `{ "error": "Validation failed", ... }` | Body is missing or contains invalid data |
| 400    | `{ "error": "Invalid user ID" }`        | ID is not a number                      |
| 404    | `{ "error": "User not found" }`         | No user with that ID                    |
| 404    | `{ "error": "Not found" }`              | Unknown path or method                  |
| 500    | `{ "error": "Internal server error" }`  | Unexpected server error                 |
