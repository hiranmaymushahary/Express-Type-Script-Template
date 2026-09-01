# This project, in simple English

This is a small **Express + TypeScript** backend template. Think of it as a restaurant:

- The **server** is the building and the front door.
- **Routers** are the waiters who take the order and send it to the right place.
- **Validators** are the people who check if the order makes sense before cooking.
- **Controllers** are the kitchen. They do the actual work and send back the food (the response).
- **Config** is the list of settings, like which port the restaurant opens on.

When someone visits a URL like `http://localhost:3003/api/v1/ping`, the request walks through those layers in that order.

---

## The big picture (how a request travels)

```
Browser / Postman
        |
        v
   src/server.ts          <- app starts here, listens on a port
        |
        v
   src/router/v1 or v2    <- picks the version of the API
        |
        v
   src/validators         <- checks if the request data is valid
        |
        v
   src/controllers        <- runs the real logic, sends the reply
```

We split the code into folders so one file does not become a giant mess. Each folder has one job.

---

## Root of the project (the top folder)

This is `EXPRESSTEMPLATE`. Everything lives here.

### `package.json`

This is the **ID card** of the project.

- It tells Node the project name and version.
- It lists **dependencies** (code we did not write, but we use):
  - `express` — the web server framework
  - `dotenv` — reads secret/settings from `.env`
  - `zod` — checks that incoming data looks like we expect
- It lists **devDependencies** (tools only for development):
  - `typescript` — lets us write typed JavaScript
  - `tsx` — runs TypeScript files without compiling first
  - type packages so Express and Node have types
- **Scripts:**
  - `npm start` — run the server once
  - `npm run dev` — run the server and restart when you save files

### `package-lock.json`

This file **locks exact versions** of every installed package. You do not edit this by hand. It makes sure your laptop and a friend’s laptop install the same libraries.

### `.env`

This holds **settings that can change** (and should not be hardcoded in source files). Right now it has:

- `PORT=3003` — which port the server listens on

Why a separate file? So you can use port 3003 on your machine and a different port on a production server, without changing the code.

### `tsconfig.json`

This tells TypeScript **how to compile** our `.ts` files.

Important bits:

- `rootDir: ./src` — our real code lives in `src`
- `outDir: ./dist` — compiled JavaScript goes into `dist`
- `strict: true` — TypeScript is strict and catches more mistakes

### `node_modules/`

This folder is created when you run `npm install`. It is a **giant warehouse of downloaded libraries**. We never write code here. We also usually do not commit it to git.

### `dist/`

This is **compiled JavaScript**. TypeScript in `src` can be turned into JS here. When you run with `tsx`, you often skip this folder and run TypeScript directly. It is output, not something you edit.

---

## `src/` — all of our application code

This is the only folder we actually write the app in. Everything inside is TypeScript.

### `src/server.ts` — the front door

This file **starts the whole app**.

What it does:

1. Creates an Express app (`const app = express()`).
2. Teaches Express how to read request bodies:
   - `express.json()` — JSON like `{ "message": "hello" }`
   - `express.text()` — plain text
   - `express.urlencoded()` — form data from HTML forms
3. Attaches versioned APIs:
   - `/api/v1` → version 1 routes
   - `api/v2` → version 2 routes (note: this path is missing a `/` in the current code)
4. Starts listening on the port from config and prints a message.

If `server.ts` is not running, nothing else in the project can answer HTTP requests.

---

## `src/config/` — settings for the app

**Why this folder exists:**  
Settings should live in one place. If every file reads `process.env.PORT` itself, changing a setting later is painful.

### `src/config/index.ts`

- Loads `.env` using `dotenv`.
- Builds a `serverConfig` object, for example `{ PORT: 3003 }`.
- If `PORT` is missing in `.env`, it falls back to `3001`.

Later you can add more settings here (database URL, JWT secret, etc.) without touching routers or controllers.

---

## `src/router/` — the map of URLs

**Why this folder exists:**  
Routers answer: “When someone hits this URL with this HTTP method, which function should run?”

They should stay thin. A router should **not** cook the food. It should only:

- define the path (`/ping`)
- attach middleware (like validation)
- call a controller

We also split by **API version** (`v1`, `v2`). That way old mobile apps can keep using `/api/v1` while you change `/api/v2`.

### `src/router/v1/`

Version 1 of the API. Mounted in `server.ts` as `/api/v1`.

#### `src/router/v1/index.router.ts`

This is the **main switchboard** for v1. Right now it says:

- `GET /ping` → run `pingHandler`

So the full URL is: `GET /api/v1/ping`

#### `src/router/v1/ping.router.ts`

This is a **more complete ping router** (a small sub-router just for ping).

- `GET /` with validation, then `pingHandler`
- `GET /health` which just replies `"ok"` (a simple “is the service alive?” check)

This file exists so ping-related routes can live together. `index.router.ts` can later do `v1Router.use("/ping", pingRouter)` so you get:

- `GET /api/v1/ping`
- `GET /api/v1/ping/health`

Right now `index.router.ts` still calls `pingHandler` directly, and this ping router is not wired in yet. That is a common next step.

### `src/router/v2/`

Version 2 of the API. Same idea as v1, but a separate folder so you can change v2 without breaking v1.

#### `src/router/v2/index.router.ts`

Currently also has `GET /ping` → `pingHandler`.

In `server.ts` it is mounted as `api/v2` (without a leading slash). For it to work like v1, it should be `/api/v2`.

---

## `src/validators/` — check the incoming data

**Why this folder exists:**  
Never trust the client. People (and bugs) send empty strings, wrong types, missing fields. Validators stop bad data **before** it reaches the controller.

We use **Zod** to describe the shape of data we accept.

### `src/validators/ping.validator.ts`

Defines the rules for a ping request. Right now:

- there must be a `message`
- it must be a string
- it cannot be empty (`min(1)`)

### `src/validators/index.ts`

This is a **reusable helper**, not ping-specific.

`validate(schema)` returns Express middleware that:

1. Takes `body`, `query`, and `params` from the request.
2. Asks Zod: “Does this match the schema?”
3. If yes → `next()` (continue to the controller).
4. If no → stop and send HTTP 400 with `{ message, success, error }`.

Any new feature (users, products, etc.) can reuse this same `validate` function with a different schema.

---

## `src/controllers/` — the actual work

**Why this folder exists:**  
Controllers contain **what to do** after the request is valid.

They should not care about URL versioning details. The router already decided the path. The controller just:

- reads `req` (body, query, params)
- does work (later: talk to a database, call another API)
- sends `res` (the reply)

### `src/controllers/ping.controller.ts`

`pingHandler` is a tiny example:

- logs the body, query string, and URL params
- replies with the text `"pong"`

In a real app this is where you would create a user, fetch orders, and so on.

---

## Why we create these folders (not dump everything in one file)

| Folder            | Job in one sentence                                      |
|-------------------|----------------------------------------------------------|
| `src/config`      | Load settings (port, env vars).                          |
| `src/router`      | Map URLs to handlers. Keep versions (`v1`, `v2`) apart.  |
| `src/validators`  | Reject bad request data early.                           |
| `src/controllers` | Run the business logic and send the response.            |
| `src/server.ts`   | Create the app, plug pieces together, listen on a port.  |

Benefits:

- You can find things fast (“validation is in validators”).
- Two people can work on different folders with fewer collisions.
- You can add `users`, `orders`, etc. the same way: validator → router → controller.

Folders you will often add later (not in this template yet):

- `src/services` — reusable business logic (used by controllers)
- `src/models` or `src/repositories` — database access
- `src/middleware` — things that run on many routes (auth, logging)
- `src/utils` — small helpers (date formatting, etc.)

---

## How to run it

```bash
npm install
npm run dev
```

The server prints something like: `Server is running on http://localhost:3003`

Then try:

- `GET http://localhost:3003/api/v1/ping`

That hits: `server.ts` → `v1` router → `pingHandler` → response `"pong"`.
