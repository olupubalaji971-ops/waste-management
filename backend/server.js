require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

global.USE_MEMORY_STORE = true;
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Attach IO to request for event emissions if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection logic
global.io = io;
io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  socket.on('join_hospital', (hospitalId) => {
    socket.join(`hospital:${hospitalId}`);
    socket.join(`hospital_${hospitalId}`);
    console.log(`🏥 [Socket.io] Joined room hospital:${hospitalId}`);
  });

  socket.on('join_driver', (driverId) => {
    socket.join(`driver:${driverId}`);
    socket.join(`driver_${driverId}`);
    console.log(`🚛 [Socket.io] Joined room driver:${driverId}`);
  });

  socket.on('join_facility', (facilityId) => {
    socket.join(`facility:${facilityId}`);
    socket.join(`facility_${facilityId}`);
    console.log(`🏭 [Socket.io] Joined room facility:${facilityId}`);
  });

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    console.log(`🚪 [Socket.io] Joined custom room ${roomName}`);
  });

  socket.on('join_order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📦 [Socket.io] Joined room order:${orderId}`);
  });

  socket.on('join_role', (role) => {
    socket.join(`role_${role}`);
  });

  socket.on('driver_location_ping', (data) => {
    if (data?.hospitalId) {
      io.to(`hospital:${data.hospitalId}`).emit('driver_location_update', data);
      io.to(`hospital_${data.hospitalId}`).emit('driver_location_update', data);
    }
    if (data?.driverId) {
      io.to(`driver:${data.driverId}`).emit('driver_location_update', data);
    }
    if (data?.orderId) {
      io.to(`order:${data.orderId}`).emit('driver_location_update', data);
    }
    io.emit('driver_location_update', data);
  });

  socket.on('vehicle_location_ping', (data) => {
    io.emit('vehicle_location_update', data);
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// API Routes
app.use('/api', require('./routes/api.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/hospitals', require('./routes/hospital.routes'));
app.use('/api/hospital', require('./routes/hospital.routes'));
app.use('/api/driver', require('./routes/driver.routes'));
app.use('/api/qr', require('./routes/qr.routes'));
app.use('/api/waste', require('./routes/waste.routes'));
app.use('/api/pickups', require('./routes/pickup.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'BioWaste Smart API',
    version: '1.0.0',
    hackathon: 'Smart India Hackathon 2026',
    problemStatement: 'SIH26115 - Smart Mobile Medical-Waste Collection and Segregation System',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and Database
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🏥 BioWaste Smart Server Running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`🌿 Theme: Wildflowers (#519755, #A8DCAB, #DBAAA7, #BE91BE)`);
      console.log(`🚀 Ready for Smart India Hackathon Demonstration!`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
  }
};

startServer();
