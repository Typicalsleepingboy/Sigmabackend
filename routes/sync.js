const express = require('express');
const axios = require('axios');
const { getUsersCollection } = require('../models/User');
const { getSyncLogsCollection } = require('../models/SyncLog');

const router = express.Router();

router.post('/sync', async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        const users = response.data;
        const usersCollection = getUsersCollection();

        for (const userData of users) {
            const category = userData.company.name;
            await usersCollection.updateOne(
                { id: userData.id },
                {
                    $set: {
                        ...userData,
                        category,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );
        }

        const syncLogsCollection = getSyncLogsCollection();
        await syncLogsCollection.updateOne(
            {},
            { 
                $set: { 
                    lastSyncTime: new Date(), 
                    status: 'success',
                    code: 200,
                    message: 'Sync completed successfully' 
                } 
            },
            { upsert: true }
        );

        res.status(200).json({ 
            message: 'Sync completed successfully',
            status: 'success',
            code: 200
        });
    } catch (error) {
        const syncLogsCollection = getSyncLogsCollection();
        await syncLogsCollection.updateOne(
            {},
            { 
                $set: { 
                    lastSyncTime: new Date(), 
                    status: 'failed', 
                    code: 400,
                    message: error.message 
                } 
            },
            { upsert: true }
        );
        
        res.status(400).json({ 
            error: error.message,
            status: 'failed',
            code: 400
        });
    }
});

router.get('/last-sync', async (req, res) => {
    try {   
        const syncLogsCollection = getSyncLogsCollection();

        const log = await syncLogsCollection.findOne({}, { sort: { lastSyncTime: -1 } });

        if (!log) {
            return res.status(404).json({ 
                error: 'No sync logs found',
                status: 'failed',
                code: 404
            });
        }

        res.status(200).json({
            ...log,
            status: 'success',
            code: 200
        });
    } catch (error) {
        console.error('Error fetching last sync log:', error);
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            status: 'failed',
            code: 500
        });
    }
});

module.exports = router;