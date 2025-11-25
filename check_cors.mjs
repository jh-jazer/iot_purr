
import https from 'https';

const options = {
    hostname: 'purr-5ehg.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'OPTIONS',
    headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST'
    }
};

const req = https.request(options, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
