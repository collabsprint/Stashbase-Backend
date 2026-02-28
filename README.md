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
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── config/
│   ├── database.ts     # Sequelize configuration
│   └── logtoExpressConfig.ts  # Logto auth config
├── models/
│   └── index.ts        # Model loader
├── helper/
│   ├── ApiResponse.ts  # API response helpers
│   └── paginate.ts     # Pagination utility
└── utils/
    ├── helpers.ts      # Helper functions
    ├── errorHandler.ts # Error handling middleware
    ├── logEvents.ts    # Event logging
    ├── formatJoiError.ts # Joi error formatter
    └── corsOptions.ts  # CORS configuration
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
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs
- **Utilities**: uuid, morgan, date-fns

## ✨ Generated Files

All TypeScript files (.ts) compile to JavaScript in the `dist/` directory.
The compiled code is production-ready with source maps for debugging.
