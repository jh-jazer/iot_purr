
import { request } from 'https';

const options = {
    hostname: 'purr-5ehg.onrender.com',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
        'Origin': 'http://localhost:8081'
    }
};

const req = request(options, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
