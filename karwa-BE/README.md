# Karwa Backend API

Backend REST API for Karwa - Task management and secondary income platform.

## Tech Stack

- Node.js with Express.js
- TypeScript (strict mode)
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` and set:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string for JWT signing
   - `PORT` - Server port (default: 8000)
   - `CORS_ORIGIN` - Frontend URL for CORS

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Run the server:**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email, password, firstName?, lastName? }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  
- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`

### Health Check

- `GET /health` - Server health check

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Project Structure

```
karwa-BE/
├── src/
│   ├── config/         → Database configuration
│   ├── controllers/    → Business logic
│   ├── middleware/     → Auth, error handling
│   ├── models/         → Mongoose schemas
│   ├── routes/         → Express routes
│   ├── types/          → TypeScript types
│   └── utils/          → Helper functions
├── server.ts           → Entry point
├── package.json
└── tsconfig.json
```

## Development

The server runs on `http://localhost:8000` by default.

## License

ISC
