# StashBase Backend - TypeScript

Express.js backend with TypeScript, Sequelize ORM, and PostgreSQL.

## 📦 Installation

```bash
npm install
```

## 🏗️ Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## 🚀 Development

Run with hot-reload using ts-node:

```bash
npm run dev
```

Or compile and run:

```bash
npm run build
npm start
```

## 📝 Project Structure

```
src/
  config/
    database.ts         # Sequelize instance
    database.js
    cloudinary.ts       # Cloudinary SDK init
    logtoExpressConfig.ts # Logto auth config
 controllers/
    collectionController.ts
    stashController.ts
    searchController.ts
 helpers/
    contentType.ts      # Detect content type from URL/MIME
    paginate.ts       # Cursor/offset pagination helpers
    response.ts         # Standardised API response shape
    stashGrooper.ts  # Helper to group stashes based on content type
 middlewares/
    auth.ts             # Logto JWT verification
    validate.ts         # Joi/Zod request validation
    errorHandler.ts     # Global error handler
    asyncWrapper.ts     # Eliminate try/catch boilerplate
 migrations/
    20260227152716-create-users-table.ts
    20260227152910-create-collections-table.ts
    20260227153015-create-stashes-table.ts
    20260227153111-create-tags-table.ts
    20260227153211-create-stashCollections-table.ts
    20260227153258-create-stashTags-table.ts
  models/
    index.ts            # All model exports + associations
    User.ts
    Collection.ts
    Stash.ts
    Tag.ts
    StashCollection.ts  # junction: stash <-> collection
    StashTag.ts         # junction: stash <-> tag
  router/
    index.ts            # mounts all routers
    collection.routes.ts
    stash.routes.ts
    search.routes.ts
  services/
    collection.service.ts
    stash.service.ts
    enrichment.service.ts
    cloudinary.service.ts
    microlink.service.ts
    search.service.ts
  types/
    index.ts            # Domain types & enums
    express.d.ts        # Augment Express Request with user
  utils/
    logger.ts           # Pino logger
    errors.ts           # Custom error classes
```

## 🔧 Environment Variables

See `.env.example` for required variables.

## 📚 Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with hot-reload
- `npm start` - Production mode
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Run database seeds
- `npm run db:setup` - Migrate and seed database

## 🔐 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Auth**: Logto
- **Validation**: Zod
- **Security**: Helmet, CORS, bcryptjs
- **Utilities**: uuid, morgan, date-fns

## ✨ Generated Files

All TypeScript files (.ts) compile to JavaScript in the `dist/` directory.
The compiled code is production-ready with source maps for debugging.
