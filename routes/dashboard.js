const express = require('express');
const { getUsersCollection } = require('../models/User');

const router = express.Router();

router.get('/summary', async (req, res) => {
    try {
        const usersCollection = await getUsersCollection();
        const totalUsers = await usersCollection.countDocuments();
        const totalCategories = await usersCollection.distinct('category');
        const categoryCount = totalCategories.length;

        res.status(200).json({
            status: 'success',
            code: 200,
            data: {
                totalUsers,
                totalCategories: categoryCount
            }
        });
    } catch (error) {
        console.error('Error in /summary:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.get('/pie-chart', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let match = {};
        
        // Validate date format if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    status: 'failed',
                    code: 400,
                    message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)'
                });
            }
            
            if (start > end) {
                return res.status(400).json({
                    status: 'failed',
                    code: 400,
                    message: 'startDate cannot be after endDate'
                });
            }
            
            match.createdAt = { $gte: start, $lte: end };
        }
        
        const usersCollection = await getUsersCollection();
        const data = await usersCollection.aggregate([
            { $match: match },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { category: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        
        res.status(200).json({
            status: 'success',
            code: 200,
            data: data,
            metadata: {
                totalCategories: data.length,
                totalCount: data.reduce((sum, item) => sum + item.count, 0)
            }
        });
    } catch (error) {
        console.error('Error in /pie-chart:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.get('/column-chart', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let match = {};
        
        // Validate date format if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    status: 'failed',
                    code: 400,
                    message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)'
                });
            }

            if (start > end) {
                return res.status(400).json({
                    status: 'failed',
                    code: 400,
                    message: 'startDate cannot be after endDate'
                });
            }

            match.updatedAt = { $gte: start, $lte: end };
        } else {
            // Default to last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            match.updatedAt = { $gte: oneMonthAgo };
        }
        
        const usersCollection = getUsersCollection();
        const data = await usersCollection.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        
        res.status(200).json({
            status: 'success',
            code: 200,
            data: data,
            metadata: {
                totalDays: data.length,
                totalCount: data.reduce((sum, item) => sum + item.count, 0),
                dateRange: {
                    startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: endDate || new Date().toISOString().split('T')[0]
                }
            }
        });
    } catch (error) {
        console.error('Error in /column-chart:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});


module.exports = router;