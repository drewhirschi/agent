# Server Application

Express backend server for the AI Developer Agent.

## Features

- RESTful API with Express
- TypeScript with strict mode
- CORS enabled for client communication
- Hot reload in development with Bun
- Shared utilities from `@agent/shared` package

## Development

```bash
# From root
bun run dev:server

# From this directory
bun run dev
```

The server will run on [http://localhost:3002](http://localhost:3002).

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Hello Endpoint
```
GET /api/hello
```
Simple test endpoint.

### Data Endpoint
```
POST /api/data
Content-Type: application/json

{
  "data": "your data here"
}
```
Example POST endpoint that echoes back received data.

## Environment Variables

Create a `.env` file:

```bash
PORT=3002
NODE_ENV=development
```

## Building

```bash
bun run build
```

This creates an optimized build in the `dist/` directory.

## Running in Production

```bash
bun run start
```

## Adding Routes

Edit `src/index.ts` to add new routes:

```typescript
app.get('/api/your-route', (req, res) => {
  res.json({ message: 'Your response' });
});
```

## Using Shared Package

Import utilities from the shared package:

```typescript
import { createApiResponse, type ApiResponse } from '@agent/shared';

app.get('/api/data', (req, res) => {
  const response = createApiResponse({ message: 'Hello' });
  res.json(response);
});
```

## Tech Stack

- Express 4
- TypeScript 5
- Bun runtime
- CORS middleware

