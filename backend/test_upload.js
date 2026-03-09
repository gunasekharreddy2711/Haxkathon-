// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

const fs = require('fs');
const http = require('http');

const boundary = '--------------------------' + Math.random().toString(16).substr(2);
fs.writeFileSync('dummy.jpg', 'fake image data');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/upload',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', data));
});

req.write(`--${boundary}\r\n`);
req.write('Content-Disposition: form-data; name="userId"\r\n\r\n1\r\n');
req.write(`--${boundary}\r\n`);
req.write('Content-Disposition: form-data; name="userName"\r\n\r\nTestUser\r\n');
req.write(`--${boundary}\r\n`);
req.write('Content-Disposition: form-data; name="receipt"; filename="dummy.jpg"\r\n');
req.write('Content-Type: image/jpeg\r\n\r\n');
req.write(fs.readFileSync('dummy.jpg'));
req.write(`\r\n--${boundary}--\r\n`);
req.end();
