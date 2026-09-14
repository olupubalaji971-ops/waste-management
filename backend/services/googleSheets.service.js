/**
 * Google Sheets & Google Drive Operational Mirror Service
 * Connects directly to Google Apps Script Web App to:
 * 1. Log Hospital Logins & Hospital Details to Google Sheets
 * 2. Log Driver Registrations & Driver Logins to Google Sheets
 * 3. Upload Driver Photos to Google Drive & link URLs in Google Sheets
 * 4. Log Waste Batches, Driver Requests, QR Scans, and Collections
 */

const fs = require('fs');
const path = require('path');

// In-memory operational tables mirror
const sheetsStorage = {
  Hospitals: [],
  Hospital_Logins: [],
  Drivers: [],
  Driver_Logins: [],
  WasteBatches: [],
  DriverRequests: [],
  QRScans: [],
  Collections: [],
  Disposal_Facilities: [],
  Disposal_Logs: [],
  Tracking_Logs: [],
};

class GoogleSheetsService {
  constructor() {
    this.webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      'https://script.google.com/macros/s/AKfycbwIAGiL_0KdO55R2icXo_97KU4sDc6c-H7OJsbmN8de3A_k3RTbnMcrxhEEnYlpYJRE/exec';
  }

  /**
   * Log a new row to the specified sheet table
   * @param {string} sheetName - 'Hospitals' | 'Hospital_Logins' | 'Drivers' | 'Driver_Logins' | 'WasteBatches' | 'DriverRequests' | 'QRScans' | 'Collections'
   * @param {object} rowData - Object containing row fields
   */
  async logRow(sheetName, rowData) {
    try {
      if (!sheetsStorage[sheetName]) {
        sheetsStorage[sheetName] = [];
      }

      // Sanitize row data before logging
      const sanitized = this.sanitize(sheetName, rowData);
      const timestampedRow = {
        _loggedAt: new Date().toISOString(),
        ...sanitized,
      };

      sheetsStorage[sheetName].unshift(timestampedRow);

      // Keep last 500 rows in memory per sheet
      if (sheetsStorage[sheetName].length > 500) {
        sheetsStorage[sheetName] = sheetsStorage[sheetName].slice(0, 500);
      }

      // Dispatch to Google Apps Script Web App (Google Sheets + Google Drive)
      if (this.webhookUrl) {
        this.postToGoogleAppsScript(sheetName, timestampedRow).catch((err) => {
          console.warn(`⚠️ [GoogleSheets] Async sync notice: ${err.message}`);
        });
      }

      return { success: true, logged: true };
    } catch (error) {
      console.error(`⚠️ [GoogleSheets] Log error (non-fatal):`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send row and images to Google Apps Script Webhook (POST + GET Fallback)
   */
  async postToGoogleAppsScript(sheetName, data) {
    if (!this.webhookUrl) return;

    try {
      const payload = {
        action: 'log_row',
        sheetName: sheetName,
        sheet: sheetName,
        data: data,
        ...data,
        timestamp: new Date().toISOString(),
      };

      // If driver photo is base64, request Google Drive photo storage
      if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
        payload.driverPhotoBase64 = data.photoUrl;
        payload.driverId = data.driverId || 'DRV-TS';
        payload.driverName = data.name || data.driverName || 'Driver';
      }

      if (data.licensePhotoUrl && data.licensePhotoUrl.startsWith('data:image')) {
        payload.licensePhotoBase64 = data.licensePhotoUrl;
      }

      // 1. Try POST request
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const responseText = await response.text();
      let isSuccess = response.status === 200 && !responseText.includes('Unauthorized') && !responseText.includes('"success":false');

      // 2. If POST fails or was unauthorized, fallback to GET query delivery
      if (!isSuccess) {
        const queryParams = new URLSearchParams();
        queryParams.append('action', 'log_row');
        queryParams.append('sheetName', sheetName);
        for (const [k, v] of Object.entries(data)) {
          if (k !== 'photoUrl' && k !== 'licensePhotoUrl') {
            queryParams.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
          }
        }

        const getUrl = `${this.webhookUrl}?${queryParams.toString()}`;
        const getRes = await fetch(getUrl, { redirect: 'follow' });
        const getText = await getRes.text();
        console.log(`📊 [GoogleSheets Sync via GET fallback] [${sheetName}]: status ${getRes.status} -> ${getText.slice(0, 100)}`);
        return { success: true, status: getRes.status, body: getText };
      }

      console.log(`📊 [GoogleSheets Sync via POST] [${sheetName}]: status ${response.status} -> ${responseText.slice(0, 100)}`);
      return { success: true, status: response.status, body: responseText };
    } catch (err) {
      console.warn(`⚠️ [GoogleSheets] Webhook connection warning: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sanitize fields to protect sensitive credentials and PII
   */
  sanitize(sheetName, data) {
    const copy = { ...data };

    // Remove password hashes and plaintext credentials
    delete copy.password;
    delete copy.passwordHash;
    delete copy.confirmPassword;

    // Mask Aadhaar & License if raw numbers present
    if (copy.aadhaarNumber) {
      const clean = String(copy.aadhaarNumber).replace(/[^0-9]/g, '');
      copy.aadhaarLast4 = clean.slice(-4) || 'XXXX';
      delete copy.aadhaarNumber;
      delete copy.aadhaarEncrypted;
    }

    if (copy.drivingLicenseNumber) {
      copy.licenseLast4 = String(copy.drivingLicenseNumber).slice(-4) || 'XXXX';
      delete copy.drivingLicenseNumber;
      delete copy.licenseNumberEncrypted;
    }

    return copy;
  }

  /**
   * Get all rows for a given sheet
   */
  getSheetData(sheetName) {
    return sheetsStorage[sheetName] || [];
  }

  /**
   * Get complete multi-sheet dataset for admin reporting & live UI
   */
  getAllSheets() {
    return {
      Hospitals: sheetsStorage.Hospitals || [],
      Hospital_Logins: sheetsStorage.Hospital_Logins || [],
      Drivers: sheetsStorage.Drivers || [],
      Driver_Logins: sheetsStorage.Driver_Logins || [],
      WasteBatches: sheetsStorage.WasteBatches || [],
      DriverRequests: sheetsStorage.DriverRequests || [],
      QRScans: sheetsStorage.QRScans || [],
      Collections: sheetsStorage.Collections || [],
      Disposal_Facilities: sheetsStorage.Disposal_Facilities || [],
      Disposal_Logs: sheetsStorage.Disposal_Logs || [],
      Tracking_Logs: sheetsStorage.Tracking_Logs || [],
      lastSync: new Date().toISOString(),
      webhookUrl: this.webhookUrl,
    };
  }
}

module.exports = new GoogleSheetsService();
