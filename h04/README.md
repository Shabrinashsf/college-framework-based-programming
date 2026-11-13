# PBKK H04 – NestJS REST API with TypeORM and Prisma

A simple Twitter-style REST API (users, posts, likes) built with [NestJS](https://nestjs.com). The same features are implemented **twice** with different ORMs so the two approaches can be compared side by side:

| ORM         | Route prefix | Database                  | Source code                |
| ----------- | ------------ | ------------------------- | -------------------------- |
| TypeORM 0.3 | `/typeorm/*` | SQLite `ecommerce.sqlite` | [src/typeorm](src/typeorm) |
| Prisma 6    | `/prisma/*`  | SQLite `prisma/dev.db`    | [src/prisma](src/prisma)   |

## Tech stack

- NestJS 11 (Express), TypeScript
- TypeORM + `@nestjs/typeorm`, SQLite (`sqlite3`)
- Prisma (`@prisma/client`), SQLite
- `class-validator` and `class-transformer` for DTO validation
- `@nestjs/mapped-types` (`PartialType`) for update DTOs
- Jest + Supertest for e2e tests
- Package manager: **pnpm**

## Project structure

```
src/
├── main.ts                  # bootstrap + global ValidationPipe
├── app.module.ts            # combines TypeormModule and PrismaModule
├── app.controller.ts        # GET /  -> "Hello World!"
├── typeorm/
│   ├── typeorm.module.ts    # TypeORM connection config (synchronize: true)
│   ├── users/ posts/ likes/ # each folder: controller, service, module, dto/, entities/
└── prisma/
    ├── prisma.module.ts
    ├── prisma.service.ts    # PrismaClient as a NestJS provider
    └── users/ posts/ likes/ # each folder: controller, service, module, dto/
prisma/
└── schema.prisma            # Prisma schema (User, Post, Like models)
test/
└── app.e2e-spec.ts          # e2e tests for both ORMs
```

## Data model

```
User 1 ──< Post       (Post.authorId -> User.id)
User 1 ──< Like       (Like.userId   -> User.id)
Post 1 ──< Like       (Like.postId   -> Post.id)
```

| Model | Fields                               |
| ----- | ------------------------------------ |
| User  | `id`, `name`, `email` (unique)       |
| Post  | `id`, `title`, `content`, `authorId` |
| Like  | `id`, `userId`, `postId`             |

In TypeORM, relations are defined with decorators on the entities (`@OneToMany`, `@ManyToOne`). In Prisma, relations are defined in [prisma/schema.prisma](prisma/schema.prisma).

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the Prisma database

```bash
pnpm prisma generate     # generate the Prisma Client
pnpm prisma db push      # create the tables in prisma/dev.db
```

The TypeORM database needs no manual setup. Its tables are created automatically (`synchronize: true`) when the app starts.

### 3. Run the app

```bash
pnpm run start:dev     # watch mode
pnpm run start         # single run
pnpm run build && pnpm run start:prod
```

The server runs at `http://localhost:3000` (override with the `PORT` environment variable).

## Endpoints

The endpoint pattern is the same for both ORMs. Replace `{orm}` with `typeorm` or `prisma`.

| Method                                                  | Path               | Description                                    |
| ------------------------------------------------------- | ------------------ | ---------------------------------------------- |
| `GET`                                                   | `/`                | Health check, returns `Hello World!`           |
| `POST`                                                  | `/{orm}/users`     | Create a user                                  |
| `GET`                                                   | `/{orm}/users`     | List all users (including `posts` and `likes`) |
| `GET`                                                   | `/{orm}/users/:id` | Get a user, `404` if not found                 |
| `PATCH`                                                 | `/{orm}/users/:id` | Partially update a user                        |
| `DELETE`                                                | `/{orm}/users/:id` | Delete a user                                  |
| `POST` / `GET` / `GET :id` / `PATCH :id` / `DELETE :id` | `/{orm}/posts`     | Post CRUD                                      |
| `POST` / `GET` / `GET :id` / `PATCH :id` / `DELETE :id` | `/{orm}/likes`     | Like CRUD                                      |

### Example request bodies

```jsonc
// POST /typeorm/users  or  /prisma/users
{ "name": "Budi", "email": "budi@example.com" }

// POST /typeorm/posts  or  /prisma/posts
{ "title": "Hello", "content": "Post content", "authorId": 1 }

// POST /typeorm/likes  or  /prisma/likes
{ "userId": 1, "postId": 1 }

// PATCH: send only the fields you want to change
{ "name": "Budi Santoso" }
```

## Validation

A global `ValidationPipe` is enabled in [src/main.ts](src/main.ts) with `whitelist`, `forbidNonWhitelisted`, and `transform`. Fields that are not declared in the DTO are rejected with `400 Bad Request`.

| DTO             | Rules                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `CreateUserDto` | `name`: string, required, max 100 characters. `email`: string, required, max 50 characters                    |
| `CreatePostDto` | `title`: string, required, max 100. `content`: string, required, max 1000. `authorId`: positive number, required |
| `CreateLikeDto` | `userId` and `postId`: positive numbers, required                                                             |
| `UpdateXxxDto`  | `PartialType(CreateXxxDto)`: every field is optional, with the same rules                                     |

Services throw a `NotFoundException` (`404`) when the requested `id` does not exist.

## Testing

```bash
pnpm run test:e2e     # e2e tests for both ORMs (31 tests)
pnpm run test         # unit tests
pnpm run test:cov     # coverage
```

The e2e tests in [test/app.e2e-spec.ts](test/app.e2e-spec.ts) boot the whole application and exercise the users, posts, and likes CRUD for both TypeORM and Prisma. After each test, all tables are cleared through the TypeORM repositories and the Prisma Client. Make sure the Prisma setup steps above have been run before running the tests.
