import mongoose from 'mongoose';

// Track connection state
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Reusing existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

export default connectToDatabase;
