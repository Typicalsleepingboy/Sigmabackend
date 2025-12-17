const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

const connectDB = async () => {
    try {
        await client.connect();
        db = client.db('telkomsigma');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const getDb = () => db;

module.exports = { connectDB, getDb };