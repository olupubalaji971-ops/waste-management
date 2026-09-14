const memoryStore = require('../config/store');

const getModel = (modelName, MongooseModel) => {
  return new Proxy(MongooseModel, {
    get(target, prop) {
      if (global.USE_MEMORY_STORE) {
        const storeKeyMap = {
          User: 'users',
          Hospital: 'hospitals',
          Driver: 'drivers',
          WasteBatch: 'wasteBatches',
          DriverRequest: 'driverRequests',
          PickupRequest: 'pickupRequests',
          QRScan: 'qrScans',
          Collection: 'collections',
          Vehicle: 'vehicles',
          Notification: 'notifications',
          DisposalFacility: 'disposalFacilities',
          Tracking: 'trackings',
        };
        const storeKey = storeKeyMap[modelName] || modelName.toLowerCase() + 's';
        const coll = memoryStore[storeKey];
        if (coll && typeof coll[prop] === 'function') {
          return coll[prop].bind(coll);
        }
        if (coll && coll[prop] !== undefined) {
          return coll[prop];
        }
      }
      return target[prop];
    },
  });
};

const User = getModel('User', require('./User'));
const Hospital = getModel('Hospital', require('./Hospital'));
const Driver = getModel('Driver', require('./Driver'));
const WasteBatch = getModel('WasteBatch', require('./WasteBatch'));
const DriverRequest = getModel('DriverRequest', require('./DriverRequest'));
const PickupRequest = getModel('PickupRequest', require('./PickupRequest'));
const QRScan = getModel('QRScan', require('./QRScan'));
const Collection = getModel('Collection', require('./Collection'));
const Vehicle = getModel('Vehicle', require('./Vehicle'));
const Notification = getModel('Notification', require('./Notification'));
const DisposalFacility = getModel('DisposalFacility', require('./DisposalFacility'));
const Tracking = getModel('Tracking', require('./Tracking'));

module.exports = {
  User,
  Hospital,
  Driver,
  WasteBatch,
  DriverRequest,
  PickupRequest,
  QRScan,
  Collection,
  Vehicle,
  Notification,
  DisposalFacility,
  Tracking,
};
