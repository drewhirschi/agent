import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { handleSSE } from './mcp-server.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP SSE endpoint
app.get('/sse', handleSSE);

// POST endpoint for MCP messages
app.post('/message', express.text({ type: '*/*' }), (_req: Request, res: Response) => {
    // This is handled by the SSE transport
    res.status(200).end();
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
    console.log(`   SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
});

