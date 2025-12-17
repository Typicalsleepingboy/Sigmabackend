const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const Dashboard = require('./routes/dashboard');
const Sync = require('./routes/sync');
const Users = require('./routes/users');
require('dotenv').config();

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend Telkom Sigma API');
});

app.use("/api/dashboard", Dashboard);
app.use("/api/data", Sync);
app.use("/api/users", Users);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        code: 200,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json
        ({
            status: 'error',
            message: 'Where are you going man???'
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

