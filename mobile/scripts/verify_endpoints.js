const https = require('https');

const API_BASE = 'https://purrbackend.onrender.com/api';

const endpoints = [
    '/cats',
    '/cats/visits'
];

endpoints.forEach(endpoint => {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Checking ${url}...`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`\nURL: ${url}`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Body (first 100 chars): ${data.substring(0, 100)}`);
        });
    }).on('error', err => {
        console.error(`Error fetching ${url}:`, err.message);
    });
});
