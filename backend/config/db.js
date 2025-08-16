const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri || typeof uri !== 'string' || uri.trim() === '') {
      console.error(
        'Missing MONGO_URI. Create backend/.env and set MONGO_URI to your MongoDB connection string. Example: mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority'
      );
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;