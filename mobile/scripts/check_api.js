const https = require('https');

const url = 'https://purr-5ehg.onrender.com/api/cats/visits';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
