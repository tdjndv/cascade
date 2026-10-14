# Cascade

A Hacker News style link aggregator. Submit links or text posts, vote on them, and discuss in threaded comments that nest to any depth.

## Tech stack

Angular 22 · NestJS 11 · MySQL 8.4 · TypeORM · Nx monorepo · Docker

---

## What's in here

**Threaded comments, one query deep.** Comments are a self-referencing table — each row carries a nullable `parentId` pointing at another comment. A thread is fetched flat in a single query and assembled into a tree in memory in two O(n) passes. ORM relation loading can't do this: `relations: { replies: true }` joins exactly one level, so rendering a deep thread that way would mean either a hardcoded maximum depth or a query per node.

**Soft-deleted comments keep their children.** Deleting a comment sets `deletedAt` rather than removing the row, so replies underneath it still have a parent and stay in the tree. The node renders as `[deleted]` with the author stripped. The thread query passes `withDeleted: true` explicitly, because TypeORM's default filtering would drop the row and silently orphan everything below it.

**Vote uniqueness lives in the database.** `post_votes` and `comment_votes` each carry a composite unique index on `(userId, targetId)`. Double-voting is prevented by the constraint and handled by catching the duplicate-key error, not by checking first — a check-then-insert has a window between the SELECT and the INSERT where two concurrent requests both pass.

**Derived counts, no N+1.** Scores, comment counts, and the viewer's own votes aren't stored on the post. A feed page resolves them in four queries total regardless of page size: one for the posts, then grouped `COUNT` queries keyed by id and a single `IN` lookup for the viewer's votes, assembled through a Map and a Set. The naive shape would be three lookups per post.

**Three auth modes, one guard.** A global guard requires a token by default. `@Public()` skips it entirely for sign-in and sign-up. `@OptionalAuth()` verifies a token when one is present and carries on when it isn't — which is what lets the feed be readable logged out while still marking the posts a signed-in viewer has upvoted.

**Username in the token.** The JWT payload carries `sub` and `username`, so the client decodes it locally to render the top bar without a round trip. The decode checks expiry and is never trusted for authorization — the server verifies the signature on every request.

**Schema managed by migrations.** `synchronize` is off. Migration classes are imported explicitly rather than globbed, because webpack tree-shakes files nothing references.

**Three containers, one exposed port.** nginx serves the built Angular bundle and proxies `/api` to Nest over Docker's internal network. Neither the API nor MySQL is reachable from outside.

---

## API

All routes are prefixed `/api`.

### Auth

| Method | Route | Body | Returns |
|---|---|---|---|
| `POST` | `/auth/signup` | `{ email, username, password }` | `201` · `{ access_token }` |
| `POST` | `/auth/signin` | `{ identifier, password }` | `200` · `{ access_token }` |

`identifier` accepts a username or an email — the lookup is a single query with an OR across both unique columns. Usernames are 3–30 characters, restricted to letters, digits, hyphens and underscores so they're safe in a URL, and matched case-insensitively. A duplicate email and a duplicate username return different `409` messages.

### Posts

| Method | Route | Params | Returns |
|---|---|---|---|
| `GET` | `/posts` | `?page=&limit=&author=` | paginated feed, newest first |
| `GET` | `/posts/:id` | — | one post with score, comment count, and whether you voted |
| `POST` | `/posts` | `{ title, url? , body? }` | `201` · `{ id }` |

A post is a link or a text post, never both — exactly one of `url` and `body` must be set, checked in the service since the rule isn't expressible in a column constraint. `?author=` filters to one user's submissions, which is what the profile page uses.

Creating a post returns only the id; the client redirects to the post page, which fetches its own data.

### Comments

| Method | Route | Params | Returns |
|---|---|---|---|
| `GET` | `/posts/:id/comments` | — | the full thread as a nested tree |
| `GET` | `/comments` | `?author=&page=&limit=` | one user's comments, flat, each with its post |
| `POST` | `/posts/:id/comments` | `{ body, parentId? }` | `201` · the created comment |
| `DELETE` | `/comments/:id` | — | `204` · soft delete |

`parentId` absent means a top-level comment. A reply's parent is checked to belong to the same post, which prevents an orphaned subtree that would render nowhere.

### Votes

| Method | Route | Returns |
|---|---|---|
| `POST` | `/posts/:id/vote` | `200` · `{ score }` |
| `DELETE` | `/posts/:id/vote` | `200` · `{ score }` |
| `POST` | `/comments/:id/vote` | `200` · `{ score }` |
| `DELETE` | `/comments/:id/vote` | `200` · `{ score }` |

All four return the new score so the client updates from the server's count rather than incrementing locally and drifting. Voting twice returns `409`.

### Users

| Method | Route | Returns |
|---|---|---|
| `GET` | `/users/:username` | karma, post count, comment count, join date |

Karma is computed on read — a join from votes to the posts and comments the user authored. No denormalized counter, so it can't drift; the trade is two `COUNT` queries per profile view, which is the right side of that trade at this size.

```bash
TOKEN=$(curl -s -X POST localhost/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"yourname","password":"your-password"}' | jq -r .access_token)

ID=$(curl -s -X POST localhost/api/posts \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Show HN: Cascade","url":"https://github.com/tdjndv/cascade"}' | jq -r .id)

curl -s -X POST localhost/api/posts/$ID/comments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"body":"First."}' | jq
```

---

## Data model

```
users ──< posts ──< comments ──┐
  │         │          ^       │  self-reference: comments.parentId
  │         │          └───────┘
  │         └──< post_votes >── users
  └──────────────< comment_votes >── comments
```

One-to-many from users to posts and comments, and from posts to comments. Votes are many-to-many between users and content, modelled as explicit join entities rather than `@ManyToMany` so the rows can carry their own columns — a timestamp now, a direction later if downvotes ever land.

Comments carry `postId` as well as `parentId`, even on deep replies. It's denormalized — you could walk the parent chain to find it — but it makes fetching a thread one indexed query instead of a recursive walk.

Every foreign key cascades on delete, so removing a user removes their posts, comments and votes. Deleting a comment cascades to its subtree.

---

## Running it

### Docker

```bash
cp .env.example .env.docker    # fill in DB_PASSWORD and JWT_SECRET
docker compose up -d --build
```

```bash
openssl rand -base64 24    # DB_PASSWORD (must match MYSQL_PASSWORD in compose.yaml)
openssl rand -base64 48    # JWT_SECRET
```

The app is on `http://localhost`. Migrations run automatically on first boot; `docker compose logs backend | grep -i migration` confirms it.

### Local development

```bash
docker compose up -d db                       # MySQL on 127.0.0.1:3308
npm run migration:run
npx nx run-many -t serve -p frontend backend  # :4200 and :3000
```

The Angular dev server proxies `/api` to port 3000, so there's no CORS configuration in either environment.

### Migrations

```bash
npm run migration:generate -- apps/backend/src/migrations/DescribeTheChange
npm run migration:run
npm run migration:show
npm run migration:revert
```

Every new migration class must be added to the `migrations` array in `apps/backend/src/app/config/typeorm.config.ts`. A glob won't survive bundling — webpack drops files nothing imports, and the app would start against an unmigrated schema without complaining.

---

## Layout

```
apps/
  backend/src/
    app/
      auth/          guard with public and optional modes, decorators, JWT issuing
      users/         entity, service, profile endpoint, karma
      posts/         entity, service, controller, feed decoration
      comments/      entity, service, controller, tree building
      votes/         both vote entities, service, controller
      config/        TypeORM configuration
    migrations/
    data-source.ts   standalone DataSource for the CLI
  frontend/src/app/
    core/            auth, post and comment services, interceptors, guard, types
    features/        feed, post detail, submit, profile, sign-in, sign-up
    shared/          the recursive comment node component
    layout/          top bar
```

---

## Notes and trade-offs

**The feed is sorted by recency, not ranked.** Hacker News scores by a decay formula — roughly `score / (age + 2)^1.8` — which can't be indexed, so the usual approach is computing it over a recent window and sorting in memory. Cascade has `/new` and no front page ranking.

**No pagination on comment threads.** A post's entire thread is fetched in one query. Fine for hundreds of comments, not for thousands; at that point you'd fetch top-level comments with a subtree count and load deeper branches on demand.

**Nesting has no visual depth cap.** Past roughly ten levels the indentation eats the viewport on a phone. The original collapses deep threads behind a "continue this thread" link.

**A transfer of a comment between posts isn't possible**, and `accountId` equivalents aren't patchable — editing a comment's parent would need a second ownership check on the destination, so the update surface deliberately excludes it.

**Types are duplicated across the frontend and backend.** No shared library, because a path alias in an entity file breaks the TypeORM CLI's ts-node compilation. The duplication is a handful of interfaces that have to be changed in pairs.

**Tokens live in `localStorage`.** Simple, survives a refresh, vulnerable to XSS in principle. httpOnly cookies with refresh-token rotation would be the hardened version.