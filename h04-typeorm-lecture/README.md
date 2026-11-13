# h04-lecture

A NestJS + TypeORM project for the PBKK course (Semester 5, Lecture H04). It demonstrates how to connect a NestJS app to a database with TypeORM, using a `User` → `Post` one-to-many relation and a database that can be switched through an environment variable.

## Tech stack

- [NestJS](https://nestjs.com) 12 (Express platform)
- [TypeORM](https://typeorm.io) 1.x with `@nestjs/typeorm`
- SQLite (`better-sqlite3`) by default; PostgreSQL and MongoDB configs are included but optional
- `class-validator` / `class-transformer` for DTOs
- `dotenv` for environment configuration
- Jest for tests, oxlint and Prettier for linting and formatting
- pnpm as the package manager

## Project structure

```
src/
├── main.ts                      # app bootstrap (listens on PORT, default 3000)
├── app.module.ts                # root module, opens the single TypeORM connection
├── config/database/
│   ├── database.config.ts       # getDatabaseConfig(): picks a config by DATABASE_TYPE
│   ├── sqlite.config.ts
│   ├── postgres.config.ts
│   └── mongodb.config.ts
├── users/                       # Users module (controller, service, DTOs, entity)
└── posts/                       # Posts module (controller, service, DTOs, entity)
```

## Data model

- **User**: `id`, `name`, `email` (unique), `bio` (nullable), `createdAt`, `updatedAt`, and a one-to-many relation `Posts`.
- **Post**: `id`, `title`, `content`, `published`, `authorId`, `createdAt`, `updatedAt`, and a many-to-one relation `author`.

Tables are created automatically (`synchronize: true`) whenever `NODE_ENV` is not `production`. Do not rely on this in production; use migrations instead.

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by NestJS's ESM-only packages)
- pnpm

### Install

```bash
pnpm install
```

### Configure

Create a `.env` file in the project root. The default setup uses SQLite and needs no external database:

```env
DATABASE_TYPE=sqlite
SQLITE_DATABASE=database.sqlite
NODE_ENV=development
```

### Run

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode (build first with `pnpm run build`)
pnpm run start:prod
```

The server listens on `http://localhost:3000` unless `PORT` is set.

## Choosing a database

`DATABASE_TYPE` selects the database. If it is missing or unrecognised, SQLite is used.

| `DATABASE_TYPE`        | Extra driver to install | Environment variables                                                                                        |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `sqlite` (default)     | none (already included) | `SQLITE_DATABASE` (default `database.sqlite`)                                                                |
| `postgres` / `postgresql` | `pnpm add pg`        | `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (defaults: `localhost`, `5432`, `postgres`, `postgres`, `h04_lecture`) |
| `mongo` / `mongodb`    | `pnpm add mongodb`      | `MONGODB_URL` (default `mongodb://localhost:27017/h04_lecture`)                                              |

> **Note:** MongoDB is provided as a skeleton only. The current entities use SQL-style columns and relations (`@PrimaryGeneratedColumn`, `@ManyToOne`, `@OneToMany`), so they would need to be adapted (for example with `@ObjectIdColumn`) before they work with MongoDB.

## API endpoints

### Users (`/users`)

| Method   | Path         | Description                                  |
| -------- | ------------ | -------------------------------------------- |
| `POST`   | `/users`     | Create a user                                |
| `GET`    | `/users`     | List all users, including their posts        |
| `GET`    | `/users/:id` | Get one user with posts (404 if not found)   |
| `PATCH`  | `/users/:id` | Update a user                                |
| `DELETE` | `/users/:id` | Delete a user                                |

Example:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Ada Lovelace", "email": "ada@example.com"}'
```

### Posts (`/posts`)

The Posts module has the same CRUD routes (`POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id`), but its service is still the generated scaffold and returns placeholder strings. It is not yet connected to the database.

## Study notes: TypeORM

Reference notes from the lecture (Part 1: TypeORM), tied to the code in this repository.

### What is TypeORM?

> Code first. Classes with decorators are the schema.

TypeORM is an ORM for TypeScript/JavaScript that maps **classes** to tables (or collections).

- **Flexible patterns:** supports both DataMapper and ActiveRecord.
- **TypeScript first:** models and queries are typed.
- **Multi-database:** many SQL and NoSQL engines.
- **QueryBuilder:** joins, pagination, caching.
- **Migrations:** can be generated automatically from entities.
- **Cross-platform:** Node.js, browser, Cordova, Ionic, React Native, NativeScript, Expo, Electron.

### DataMapper vs ActiveRecord

The same entity can be used with either pattern.

| DataMapper                           | ActiveRecord                                  |
| ------------------------------------ | --------------------------------------------- |
| Entities hold data only              | Entity extends `BaseEntity`                   |
| Use a `Repository<Entity>`           | Call methods on the entity: `User.find()`     |
| Cleaner, easier to test              | Shorter for small apps                        |
| **What NestJS uses (and this course)** | Not used in this course                     |

This project uses DataMapper: `UsersService` injects a `Repository<User>` with `@InjectRepository(User)`.

### Entity: the class is the schema

There is no separate schema file. Decorators on the class describe the table. See [user.entity.ts](src/users/entities/user.entity.ts).

| Decorator                                | Meaning                          |
| ---------------------------------------- | -------------------------------- |
| `@Entity()`                              | the class is a table             |
| `@Column()`                              | a column (type is inferred)      |
| `@PrimaryGeneratedColumn()`              | auto-increment id                |
| `@CreateDateColumn()` / `@UpdateDateColumn()` | automatic timestamps        |

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column({ nullable: true }) bio: string;
  @OneToMany(() => Post, (post) => post.author) Posts: Post[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

### Many-to-One / One-to-Many

**Both sides declare the relation.** See [post.entity.ts](src/posts/entities/post.entity.ts).

- `User.Posts` uses `@OneToMany`.
- `Post.author` uses `@ManyToOne`.
- `@JoinColumn({ name: 'authorId' })` ties the relation to the explicit `authorId` column, so the foreign key can be set directly (`authorId: 1`) without loading a `User` first.

### `synchronize`: convenient but dangerous

```ts
synchronize: process.env.NODE_ENV !== 'production',
```

- `true`: TypeORM alters the tables on startup to match the entities.
- No migration files, which is great for development and class demos.
- **Never in production:** a renamed column can drop data.
- Contrast with Prisma (Part 2): schema changes always go through `prisma migrate`, which produces reviewable SQL files.

### Module wiring

```
AppModule
├── TypeOrmModule.forRoot(config)        → one connection for the whole app → Database
├── UsersModule
│   ├── TypeOrmModule.forFeature([User]) → Repository<User>
│   ├── UsersService (@InjectRepository(User))
│   └── exports UsersService  ───────────┐
└── PostsModule                          │
    ├── TypeOrmModule.forFeature([Post]) → Repository<Post>
    └── PostsService (uses UsersService) ◄┘
```

- `forRoot` = the **connection**, registered once in `AppModule` (see [app.module.ts](src/app.module.ts)).
- `forFeature([Entity])` = the **repositories** that a module may inject (see [users.module.ts](src/users/users.module.ts)).
- `exports` lets other modules (for example Posts) reuse `UsersService`.

> The Posts half of this diagram is the target design. Right now `PostsModule` does not yet import `forFeature([Post])` or `UsersModule`.

### Service pattern: load first, then mutate and save

See `update()` in [users.service.ts](src/users/users.service.ts).

- Load first with `findOne()`, which throws `NotFoundException` (404) when the row is missing, then mutate the entity and `save` it.
- `save` does an `INSERT` or an `UPDATE` depending on whether the entity already has an `id`.

### Repository cheat sheet

| Method                       | Meaning                              |
| ---------------------------- | ------------------------------------ |
| `create(obj)`                | Build an entity instance (no DB call) |
| `save(entity)`               | `INSERT` or `UPDATE`                 |
| `find({ where, relations })` | `SELECT` many                        |
| `findOne({ where })`         | One row, else `null`                 |
| `remove(entity)`             | `DELETE` an entity instance          |
| `delete(criteria)`           | `DELETE` by id/criteria              |

**Loading relations:** `relations` does a join and loads the related rows. The lecture slides write it as an array, `relations: ['posts']`, but TypeORM 1.x (used here) only accepts an object, and the key must match the property name in the entity:

```ts
// TypeORM 0.3.x style (no longer type-checks in 1.x)
find({ relations: ['posts'] });

// TypeORM 1.x style, as used in users.service.ts
find({ relations: { Posts: true } });
```

Prisma's version of this comes in Part 2.

## Testing and code quality

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov

# lint
pnpm run lint

# format
pnpm run format
```

## Useful links

- [NestJS documentation](https://docs.nestjs.com)
- [NestJS database integration with TypeORM](https://docs.nestjs.com/data/typeorm.md)
- [TypeORM documentation](https://typeorm.io)
