const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'customer.html'));
});

io.on('connection', (socket) => {
    // Table Join karne ke liye
    socket.on('join_table', (tableId) => { 
        socket.join(tableId); 
        console.log("Table Joined: " + tableId);
    });

    // Mobile scan hone par Laptop ko menu par bhejne ke liye
    socket.on('mobile_scanned', (tableId) => { 
        io.to(tableId).emit('mobile_connected', { table: tableId }); 
    });

    // --- YE HAI MAIN PART: MIRRORING LOGIC ---
    // Jab mobile pe click ho, toh table ke baki devices (Laptop) ko batao
    socket.on('sync_action', (payload) => {
        // payload mein table id aur action (open_item, update_qty, etc.) hota hai
        socket.to(payload.table).emit('sync_action', payload);
    });

    // Order Manager dashboard ke liye
    socket.on('new_order', (orderData) => { 
        io.emit('display_order_to_manager', orderData); 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
