const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

const connectDB = async () => {
    if (db) return db;
    try {
        await client.connect();
        db = client.db('telkomsigma');
        console.log('MongoDB connected');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

const getDb = async () => {
    if (!db) {
        await connectDB();
    }
    return db;
};

module.exports = { connectDB, getDb };