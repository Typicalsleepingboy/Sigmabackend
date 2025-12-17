const { getDb } = require('../config/db');

const getSyncLogsCollection = async () => {
    const db = await getDb();
    return db.collection('synclogs');
};

module.exports = { getSyncLogsCollection };