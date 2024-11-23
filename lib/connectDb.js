import mongoose from 'mongoose';

let isConnected = false; // Track the database connection status

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(
      'mongodb+srv://miraclemark147:EmZygS35hOqxYBKk@test-database.pp7ol.mongodb.net/?retryWrites=true&w=majority&appName=test-database',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw new Error(`Database connection error: ${error.message}`);
  }
};

export default connectToDatabase;
