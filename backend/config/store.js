const bcrypt = require('bcryptjs');

class InMemoryCollection {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = [...initialData];
  }

  find(query = {}) {
    let results = this.data.filter((item) => {
      for (const key in query) {
        if (key === '$or' && Array.isArray(query.$or)) {
          const match = query.$or.some((subQuery) => {
            for (const subKey in subQuery) {
              const val = subQuery[subKey];
              if (val instanceof RegExp) {
                if (!val.test(item[subKey] || '')) return false;
              } else if (item[subKey] !== val) {
                return false;
              }
            }
            return true;
          });
          if (!match) return false;
          continue;
        }

        const condition = query[key];
        if (condition && typeof condition === 'object') {
          if (condition.$regex) {
            const re = new RegExp(condition.$regex, condition.$options || 'i');
            if (!re.test(item[key] || '')) return false;
          }
          if (condition.$in && Array.isArray(condition.$in)) {
            if (!condition.$in.includes(item[key])) return false;
          }
          if (condition.$gte && (item[key] < condition.$gte)) return false;
          if (condition.$lte && (item[key] > condition.$lte)) return false;
        } else if (item[key] !== condition) {
          return false;
        }
      }
      return true;
    });

    let current = [...results];

    const chain = {
      _data: current,
      sort: (sortObj) => {
        return chain;
      },
      limit: (n) => {
        chain._data = chain._data.slice(0, n);
        return chain;
      },
      select: () => chain,
      then: (resolve, reject) => {
        try {
          resolve(chain._data);
        } catch (e) {
          if (reject) reject(e);
        }
      },
      catch: (reject) => {},
    };

    return chain;
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list && list.length > 0 ? list[0] : null;
  }

  findById(id) {
    const item = this.data.find((item) => String(item._id) === String(id)) || null;
    let doc = item ? { ...item } : null;
    if (doc && this.name === 'User') {
      doc.comparePassword = async function (entered) {
        try {
          return bcrypt.compareSync(entered, this.password);
        } catch (e) {
          return entered === this.password;
        }
      };
    }

    const chain = {
      _doc: doc,
      select: () => chain,
      then: (resolve) => resolve(chain._doc),
    };
    return chain;
  }

  async create(doc) {
    const _id = 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    let item = { _id, ...doc, createdAt: new Date(), updatedAt: new Date() };

    // if user password, hash it if not hashed
    if (item.password && !item.password.startsWith('$2a$')) {
      item.password = bcrypt.hashSync(item.password, 10);
    }

    // Attach methods if user
    if (this.name === 'User') {
      item.comparePassword = async function (entered) {
        try {
          return bcrypt.compareSync(entered, this.password);
        } catch (e) {
          return entered === this.password;
        }
      };
    }

    item.toObject = function () {
      return { ...this };
    };

    item.save = async function () {
      return this;
    };

    this.data.unshift(item);
    return item;
  }

  async insertMany(docs) {
    const inserted = [];
    for (const d of docs) {
      const item = await this.create(d);
      inserted.push(item);
    }
    return inserted;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.data.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;
    this.data[index] = { ...this.data[index], ...update, updatedAt: new Date() };
    return this.data[index];
  }

  async findOneAndUpdate(query, update, options = {}) {
    let item = await this.findOne(query);
    if (!item && options.upsert) {
      return await this.create({ ...query, ...update });
    }
    if (!item) return null;
    const index = this.data.findIndex((d) => String(d._id) === String(item._id));
    this.data[index] = { ...this.data[index], ...update, updatedAt: new Date() };
    return this.data[index];
  }

  async findOneAndDelete(query) {
    const item = await this.findOne(query);
    if (!item) return null;
    this.data = this.data.filter((d) => String(d._id) !== String(item._id));
    return item;
  }

  async updateMany(query, update) {
    const list = await this.find(query);
    for (const item of list) {
      const idx = this.data.findIndex((d) => String(d._id) === String(item._id));
      if (idx !== -1) {
        this.data[idx] = { ...this.data[idx], ...update, updatedAt: new Date() };
      }
    }
    return { modifiedCount: list.length };
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      const count = this.data.length;
      this.data = [];
      return { deletedCount: count };
    }
    const toDelete = await this.find(query);
    const toDeleteIds = new Set(toDelete.map((d) => String(d._id)));
    this.data = this.data.filter((d) => !toDeleteIds.has(String(d._id)));
    return { deletedCount: toDelete.length };
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }
}

const memoryStore = {
  users: new InMemoryCollection('User'),
  hospitals: new InMemoryCollection('Hospital'),
  drivers: new InMemoryCollection('Driver'),
  wasteBatches: new InMemoryCollection('WasteBatch'),
  driverRequests: new InMemoryCollection('DriverRequest'),
  pickupRequests: new InMemoryCollection('PickupRequest'),
  qrScans: new InMemoryCollection('QRScan'),
  collections: new InMemoryCollection('Collection'),
  vehicles: new InMemoryCollection('Vehicle'),
  notifications: new InMemoryCollection('Notification'),
  disposalFacilities: new InMemoryCollection('DisposalFacility'),
  trackings: new InMemoryCollection('Tracking'),
};

module.exports = memoryStore;
