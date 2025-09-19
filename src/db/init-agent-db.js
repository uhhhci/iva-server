const pool = require('../config/database-pg');

async function initAgentDb() {
    const createTableARequests = `
        CREATE TABLE IF NOT EXISTS all_requests (
            id SERIAL PRIMARY KEY,
            request_type TEXT,
            request TEXT,
            response TEXT,
            session_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        const client = await pool.connect();
        await client.query(createTableARequests);
        console.log('Table created successfully');
        client.release();
    } catch (err) {
        console.error(err);
    }
}

module.exports = initAgentDb;