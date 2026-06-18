const { MongoClient } = require('mongodb');

const mongoUrl = process.env.MONGOURL;
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!mongoUrl) {
    throw new Error('MONGOURL environment variable is required.');
  }

  const client = new MongoClient(mongoUrl, {
    serverApi: { version: '1' }
  });
  await client.connect();
  cachedClient = client;
  cachedDb = client.db();
  return cachedDb;
}

module.exports = { getDb };
