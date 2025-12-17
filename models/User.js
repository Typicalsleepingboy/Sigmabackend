const { getDb } = require('../config/db');

const getUsersCollection = async () => {
    const db = await getDb();
    return db.collection('users');
};

module.exports = { getUsersCollection };