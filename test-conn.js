const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres:CziFWVISVWsSuRdZMeeAmuuYbPfsMLAJu@switchback.proxy.rlwy.net:22638/railway",
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('Connected successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error', err.stack);
        process.exit(1);
    });
