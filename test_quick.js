const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: 'POST',
      headers: headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    console.log('Logging in...');
    const login = await post('/api/auth/login', { email: 'gandhi@telangana.gov.in', password: 'password123' });
    console.log('Login result:', login.success, login.user?.name);
    
    console.log('Creating waste batch...');
    const waste = await post('/api/waste', { category: 'RED', wasteType: 'IV Tubing', quantity: 15 }, login.token);
    console.log('Waste result:', waste.success, waste.data?.batchId);

    console.log('Creating pickup request...');
    const pickup = await post('/api/pickups', {
      wasteBatchIds: [waste.data?.batchId],
      wasteCategory: 'Red Plastics',
      wasteQuantity: 15,
      pickupAddress: 'Gandhi Hospital Yard',
      priority: 'Emergency',
    }, login.token);
    console.log('Pickup result:', pickup.success, pickup.data?.pickupId);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
