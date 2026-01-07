const https = require('https');

// const API_URL = 'http://localhost:5000/api'; // For local testing
const API_URL = 'https://purrbackend.onrender.com/api';

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log(`Doing a POST request to ${API_URL}/cats/seed to generate dummy data...`);

const req = https.request(`${API_URL}/cats/seed`, options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response Body:', responseBody);
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("✅ Success! Data seeded.");
        } else {
            console.log("❌ Failed to seed.");
        }
    });

});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.end();
