const { getDb } = require('../config/db');

const getSyncLogsCollection = () => getDb().collection('synclogs');

module.exports = { getSyncLogsCollection };