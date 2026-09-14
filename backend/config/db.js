const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biowaste_smart';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected natively to database at: ${primaryUri}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Local MongoDB is not running (${error.message}).`);
    console.log(`🚀 [Embedded Engine] Initializing zero-latency embedded in-memory data store for SIH 2026 presentation.`);
    // Set mock mode flag
    global.USE_MEMORY_STORE = true;
    return true;
  }
};

module.exports = connectDB;
