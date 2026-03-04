import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import { fetchSheetData } from './services/googleSheets.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all for local development. In production, set to your frontend URL.
        methods: ['GET', 'POST']
    }
});

let cache = null;

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    if (cache) {
        socket.emit('dashboard-data', cache);
    } else {
        socket.emit('sync-status', { status: 'syncing' });
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Webhook endpoint to receive triggers from Google Apps Script
app.post('/api/webhook', async (req, res) => {
    console.log('Webhook received from Google Sheets!');
    io.emit('sync-status', { status: 'syncing' });

    try {
        const data = await fetchSheetData();
        cache = data;
        io.emit('dashboard-data', data);
        io.emit('sync-status', { status: 'live' });
        res.status(200).send('Data updated successfully');
    } catch (error) {
        console.error('Error fetching sheet data during webhook:', error);
        io.emit('sync-status', { status: 'error', message: error.message });
        res.status(500).send(error.message);
    }
});

const startServer = async () => {
    try {
        console.log('Fetching initial Google Sheets data...');
        cache = await fetchSheetData();
        console.log('Initial data fetched successfully!');
    } catch (error) {
        console.error('Warning: Initial fetch failed. Ensure .env is configured correctly and credentials are valid.');
        console.error(error.message);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
