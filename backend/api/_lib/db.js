const { MongoClient, ServerApiVersion } = require('mongodb');

const mongoUrl = process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || '';

let client;
let clientPromise;

function getClientPromise() {
  if (!mongoUrl) {
    return null;
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

  return global._mongoClientPromise;
}

async function getDb() {
  const clientPromise = getClientPromise();
  if (!clientPromise) {
    throw new Error('MONGOURL environment variable is required.');
  }

  const client = await clientPromise;
  return client.db();
}

module.exports = { getDb };
