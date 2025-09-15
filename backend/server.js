// server.js

const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid'); // Example for a unique ID
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Example in-memory database for development
const inventory = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // Set CORS headers for all responses to allow frontend to access
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows any origin, for development
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests for CORS
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Routes
    if (pathname === '/api/inventory') {
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const newItem = JSON.parse(body);
                    newItem.id = uuidv4();
                    inventory.push(newItem);
                    console.log('New item added:', newItem);
                    console.log(inventory);
                     console.log("ini beneran bisa ga sih");

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Item created successfully', item: newItem }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(inventory));
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});