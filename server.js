const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

// CORS setup taaki kisi bhi device se connection ho sake
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('Royal Kitchen Server is Running...');
});

// Socket logic for Multi-Table
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Jab koi Tablet ya Mobile kisi specific table ko join kare
    socket.on('join_table', (tableId) => {
        socket.join(tableId);
        console.log(`User joined Table: ${tableId}`);
    });

    // Jab mobile scan ho, toh usi table ke tablet ko signal bhejo
    socket.on('mobile_scanned', (tableId) => {
        io.to(tableId).emit('mobile_connected', { table: tableId });
    });

    // Jab customer order "SEND" kare
    socket.on('new_order', (orderData) => {
        console.log("New Order Received:", orderData);
        // Filhal ye manager dashboard ko bhej raha hai (jab hum banayenge)
        io.emit('display_order_to_manager', orderData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});