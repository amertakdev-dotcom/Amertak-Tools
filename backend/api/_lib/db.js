const { MongoClient, ServerApiVersion } = require('mongodb');

const mongoUrl = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL;

let client;
let clientPromise;

if (!mongoUrl) {
  throw new Error('MONGOURL environment variable is required.');
}

if (!global._mongoClientPromise) {
  client = new MongoClient(mongoUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function getDb() {
  const client = await clientPromise;
  return client.db();
}

module.exports = { getDb };
