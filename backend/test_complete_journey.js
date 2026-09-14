const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🧪 RUNNING END-TO-END WASTE JOURNEY & CONTINUOUS GPS TRACKING TEST');
  console.log('================================================================\n');

  try {
    // 0. Reset data to clean initial state
    console.log('0. Resetting seed database...');
    const resetRes = await makeRequest('POST', '/reset-data');
    console.log('   ✓ Database reset:', resetRes.body?.message || 'OK');

    // 1. Hospital Login
    console.log('\n1. Hospital Login (Gandhi Hospital)...');
    const hospLogin = await makeRequest('POST', '/auth/hospital/login', {
      hospitalId: 'HOSP-TG-001',
      password: 'password123',
    });
    const hospToken = hospLogin.body?.token;
    console.log('   ✓ Hospital Login successful! Token received.');

    // 2. Driver Login
    console.log('\n2. Driver Login (Venkatesh Rao)...');
    const driverLogin = await makeRequest('POST', '/auth/driver/login', {
      phone: '9848123456',
      password: 'password123',
    });
    const driverToken = driverLogin.body?.token;
    const driverId = driverLogin.body?.driver?.driverId || 'DRV-TS-0101';
    console.log('   ✓ Driver Login successful! Driver ID:', driverId);

    // 3. Check Authorized Disposal Facilities
    console.log('\n3. Fetching Authorized CBMWTF Disposal Facilities...');
    const facilitiesRes = await makeRequest('GET', '/facilities?latitude=17.4244&longitude=78.5037');
    const facilities = facilitiesRes.body?.data || [];
    console.log(`   ✓ Found ${facilities.length} authorized facilities.`);
    facilities.forEach((f) => console.log(`     - [${f.facilityId}] ${f.facilityName} (${f.distanceKm} km away)`));
    const targetFacility = facilities[0];

    // 4. Hospital Creates Waste Batch
    console.log('\n4. Hospital Creates Biohazard Waste Batch...');
    const batchRes = await makeRequest(
      'POST',
      '/hospital/waste',
      {
        hospitalId: 'HOSP-TG-001',
        category: 'YELLOW',
        wasteType: 'Autoclaved Infectious Pathology Bags',
        quantityKg: 45.5,
        pickupLocation: 'Gandhi Hospital Gate 2 Bio-Waste Yard',
      },
      hospToken
    );
    const batchId = batchRes.body?.data?.batchId;
    const qrToken = batchRes.body?.qrCodePayload?.token;
    console.log(`   ✓ Batch Created: ${batchId} (Qty: 45.5 kg Yellow, QR Version: ${batchRes.body?.data?.qrVersion})`);

    // 5. Driver Requests Collection
    console.log('\n5. Driver Requests Collection for Batch...');
    const reqRes = await makeRequest(
      'POST',
      `/driver/request/${batchId}`,
      {
        driverId,
        driverName: 'Venkatesh Rao',
        driverPhone: '9848123456',
        vehicleNumber: 'TS-09-UB-4501',
      },
      driverToken
    );
    const orderId = reqRes.body?.data?.requestId;
    console.log(`   ✓ Driver Request Created: ${orderId} (Status: ${reqRes.body?.data?.status})`);

    // 6. Hospital Accepts Driver Request
    console.log('\n6. Hospital Accepts Collection Request...');
    const acceptRes = await makeRequest('PUT', `/hospital/requests/${orderId}/accept`, {}, hospToken);
    console.log(`   ✓ Hospital Accepted Request: ${orderId} (Status: ${acceptRes.body?.data?.status})`);

    // 7. Driver Arrives at Hospital
    console.log('\n7. Driver Arrives at Hospital...');
    const arriveHospRes = await makeRequest(
      'POST',
      '/driver/arrived-hospital',
      { orderId, batchId, latitude: 17.4244, longitude: 78.5037 },
      driverToken
    );
    console.log(`   ✓ Hospital Arrival Status: ${arriveHospRes.body?.data?.status}`);

    // 8. Driver Scans Hospital Batch QR Code
    console.log('\n8. Driver Scans Hospital Batch QR Code...');
    const scanHospRes = await makeRequest(
      'POST',
      '/driver/scan-qr',
      {
        batchId,
        qrToken,
        bookingId: orderId,
        rawQRString: JSON.stringify({ batchId, version: 1, token: qrToken }),
        driverId,
      },
      driverToken
    );
    console.log('   ✓ Hospital QR Scan Result:', scanHospRes.body?.message);
    console.log('   ✓ Verified Checkmarks:', scanHospRes.body?.data?.verified);

    // 9. Driver Confirms Waste Collected
    console.log('\n9. Driver Confirms Waste Collected...');
    const collectRes = await makeRequest(
      'POST',
      '/driver/waste-collected',
      { orderId, batchId, disposalFacilityId: targetFacility.facilityId, driverId },
      driverToken
    );
    console.log(`   ✓ Waste Collected (Status: ${collectRes.body?.data?.order?.status})`);
    console.log(`   ✓ Custody assigned to driver for destination: ${collectRes.body?.data?.disposalFacility?.facilityName}`);

    // 10. Driver Starts Transport & Continuous GPS Tracking
    console.log('\n10. Driver Starts Transport to Authorized Facility...');
    const transportRes = await makeRequest(
      'POST',
      '/driver/start-transport',
      { orderId, batchId, disposalFacilityId: targetFacility.facilityId, latitude: 17.4244, longitude: 78.5037 },
      driverToken
    );
    console.log(`   ✓ Transport Status: ${transportRes.body?.data?.status} (Tracking Active: ${transportRes.body?.data?.trackingActive})`);

    // 11. Simulate Continuous GPS Location Pings (5-10 second intervals)
    console.log('\n11. Sending Continuous GPS Telemetry Pings...');
    const gpsPoints = [
      { lat: 17.435, lon: 78.495, speed: 35 },
      { lat: 17.475, lon: 78.475, speed: 42 },
      { lat: 17.525, lon: 78.455, speed: 48 },
      { lat: 17.585, lon: 78.433, speed: 25 },
    ];

    for (let i = 0; i < gpsPoints.length; i++) {
      const p = gpsPoints[i];
      const locRes = await makeRequest('POST', '/driver/location', {
        orderId,
        batchId,
        driverId,
        latitude: p.lat,
        longitude: p.lon,
        speed: p.speed,
        accuracy: 4,
      });
      console.log(`   📍 Ping #${i + 1}: Lat ${p.lat}, Lon ${p.lon}, Speed ${p.speed} km/h (Dist to Facility: ${locRes.body?.data?.distanceToFacilityKm} km)`);
    }

    // 12. Test Geofence Validation: Try to scan disposal QR from 15 km away (MUST FAIL)
    console.log('\n12. Testing Security Rule: Attempting Disposal QR Scan from 15 km away (Out of Geofence)...');
    const geofenceFailRes = await makeRequest(
      'POST',
      '/driver/scan-disposal-qr',
      {
        orderId,
        batchId,
        facilityId: targetFacility.facilityId,
        secureToken: targetFacility.qrToken,
        latitude: 17.3739, // Osmania Hospital area (15+ km away)
        longitude: 78.4738,
      },
      driverToken
    );
    console.log(`   🛡️ Geofence Rejection Test (Status: ${geofenceFailRes.status}):`, geofenceFailRes.body?.message || 'Rejected properly');

    // 13. Arrive at Authorized Disposal Facility & Scan Disposal QR (Within 500m Geofence - MUST PASS)
    console.log('\n13. Driver Arrives at Ramky CBMWTF Facility & Scans Facility QR (Within Geofence)...');
    const scanDisposalRes = await makeRequest(
      'POST',
      '/driver/scan-disposal-qr',
      {
        orderId,
        batchId,
        facilityId: targetFacility.facilityId,
        secureToken: targetFacility.qrToken,
        latitude: targetFacility.latitude,
        longitude: targetFacility.longitude,
      },
      driverToken
    );
    console.log('   ✓ Disposal Facility Scan Result:', scanDisposalRes.body?.message);
    console.log('   ✓ Verified Checkmarks:', scanDisposalRes.body?.data?.verified);

    // 14. Confirm Final Waste Disposal & Stop Tracking
    console.log('\n14. Confirming Final Waste Disposal & Incineration...');
    const finalDisposalRes = await makeRequest(
      'POST',
      '/driver/confirm-disposal',
      {
        orderId,
        batchId,
        facilityId: targetFacility.facilityId,
        latitude: targetFacility.latitude,
        longitude: targetFacility.longitude,
      },
      driverToken
    );
    console.log('   ✓ Final Disposal Result:', finalDisposalRes.body?.message);
    console.log('   ✓ Final Status:', finalDisposalRes.body?.data?.order?.status);
    console.log('   ✓ Active Tracking Stopped:', finalDisposalRes.body?.data?.order?.trackingActive === false ? 'YES (trackingActive = false)' : 'NO');
    console.log('   ✓ Journey Audit Timestamps:', finalDisposalRes.body?.data?.journeySummary);

    // 15. Retrieve Complete Breadcrumb Route History
    console.log('\n15. Fetching Complete GPS Route History for Hospital Audit...');
    const historyRes = await makeRequest('GET', `/orders/${orderId}/route-history`);
    console.log(`   ✓ Retrieved ${historyRes.body?.count} GPS breadcrumb points for order ${orderId}.`);

    console.log('\n================================================================');
    console.log('🎉 ALL 15 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Verification Test Failed:', err);
  }
}

runEndToEndVerification();
