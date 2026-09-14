/**
 * ==============================================================================
 * BIOWASTE SMART - DUAL-CHANNEL GOOGLE SHEETS & GOOGLE DRIVE SCRIPT
 * ==============================================================================
 */
var DRIVE_FOLDER_NAME = "BioWaste_Driver_Photos";

function doPost(e) {
  try {
    var rawContents = (e && e.postData) ? e.postData.contents : "{}";
    var payload = {};
    try {
      payload = JSON.parse(rawContents);
    } catch(err) {
      payload = e.parameter || {};
    }
    return processLog(payload);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.sheetName || e.parameter.sheet || e.parameter.hospitalName || e.parameter.driverName)) {
      var payload = e.parameter;
      if (payload.data && typeof payload.data === 'string') {
        try {
          var parsedData = JSON.parse(payload.data);
          payload = Object.assign({}, payload, parsedData);
        } catch(err) {}
      }
      return processLog(payload);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "OK",
      service: "BioWaste Smart Google Sheets & Drive Operational API",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function processLog(payload) {
  var sheetName = payload.sheetName || payload.sheet || 'GeneralLogs';
  var data = payload.data || payload;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Save Driver Photo to Google Drive
  if (payload.driverPhotoBase64 || (data.photoUrl && data.photoUrl.indexOf('data:image') === 0)) {
    var photoBase64 = payload.driverPhotoBase64 || data.photoUrl;
    var driverId = payload.driverId || data.driverId || 'DRV-TS';
    var driverName = payload.driverName || data.name || 'Driver';
    
    var photoDriveUrl = saveBase64ToDrive(photoBase64, "Photo_" + driverId + "_" + driverName + ".jpg");
    data.googleDrivePhotoUrl = photoDriveUrl;
    delete data.photoUrl;
    delete data.driverPhotoBase64;
  }

  // 2. Append Row to Designated Sheet
  var sheet = getOrCreateSheet(ss, sheetName, data);
  appendRowData(sheet, data);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Successfully stored in Google Sheet: " + sheetName,
    sheetName: sheetName,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function saveBase64ToDrive(base64Data, filename) {
  try {
    var folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
    var cleanBase64 = base64Data;
    var contentType = "image/jpeg";
    if (base64Data.indexOf(';base64,') !== -1) {
      var parts = base64Data.split(';base64,');
      contentType = parts[0].replace('data:', '');
      cleanBase64 = parts[1];
    }
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, contentType, filename);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Drive Error: " + err.toString();
  }
}

function getOrCreateDriveFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateSheet(ss, sheetName, dataObj) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    try {
      sheet = ss.insertSheet(sheetName);
      var headers = ["Timestamp"];
      for (var key in dataObj) {
        if (dataObj.hasOwnProperty(key) && key !== '_loggedAt' && key !== 'data' && key !== 'action' && key !== 'sheet' && key !== 'sheetName') {
          headers.push(formatHeader(key));
        }
      }
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1B4D3E");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    } catch (e) {
      sheet = ss.getSheetByName(sheetName);
    }
  }
  return sheet;
}

function appendRowData(sheet, dataObj) {
  if (!sheet) return;
  var headerRow = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headerRow.length; i++) {
    var header = headerRow[i];
    if (i === 0 && header === "Timestamp") {
      newRow.push(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      continue;
    }
    var matchedValue = "";
    for (var key in dataObj) {
      if (formatHeader(key).toLowerCase() === header.toLowerCase() || key.toLowerCase() === header.toLowerCase()) {
        matchedValue = dataObj[key];
        break;
      }
    }
    newRow.push(matchedValue !== undefined ? matchedValue : "");
  }
  sheet.appendRow(newRow);
}

function formatHeader(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){ return s.toUpperCase(); }).trim();
}
