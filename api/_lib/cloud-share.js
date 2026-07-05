const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

const MAX_FILE_SIZE = 100 * 1024 * 1024;

async function getDb() {
  const uri = process.env.MONGO_URL || process.env.MONGOURL || process.env.MONGODB_URI || process.env.MONGODB_URL || '';
  if (!uri) {
    throw new Error('MongoDB connection is not configured. Set MONGO_URL, MONGOURL, MONGODB_URI or MONGODB_URL in the environment.');
  }

  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000
  });

  await client.connect();
  cachedClient = client;
  cachedDb = client.db(process.env.MONGO_DB || process.env.MONGO_DB_NAME || 'amertak_tools');
  return cachedDb;
}

async function getCollection() {
  const db = await getDb();
  return db.collection('cloud_shares');
}

function getCategoryFromMime(mimeType = 'application/octet-stream', fileName = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (/\.(zip|rar|7z|tar|gz|bz2)$/i.test(fileName)) return 'archive';
  return 'file';
}

function createId() {
  return `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractBase64Payload(value) {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  if (value.startsWith('data:')) {
    const [header, body] = value.split(',');
    const mimeType = header.match(/data:(.*?);/)?.[1] || 'application/octet-stream';
    return { mimeType, data: body || '' };
  }
  return { mimeType: 'application/octet-stream', data: value };
}

function getShareUrl(req, shareId) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${proto}://${host}/tools/cloude/share/${shareId}`;
}

function validatePayload(payload) {
  const fileName = payload.fileName || payload.name || 'shared-file';
  const mimeType = payload.mimeType || 'application/octet-stream';
  const size = Number(payload.size || 0);

  if (!payload.fileData || typeof payload.fileData !== 'string') {
    throw new Error('No file content was provided.');
  }

  if (size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 100MB limit.');
  }

  if (/[<>:"/\\|?*\x00-\x1f]/.test(fileName)) {
    throw new Error('Invalid filename. Contains restricted characters.');
  }

  return { fileName, mimeType, size };
}

// Step 1: Upload file and store it without a share token
async function saveFile(req, payload) {
  const collection = await getCollection();
  const { fileName, mimeType, size } = validatePayload(payload);
  const parsed = extractBase64Payload(payload.fileData || payload.data || payload.base64);
  const id = createId();
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    id,
    fileName,
    name: fileName,
    description: payload.description || '',
    mimeType,
    size,
    category: payload.category || getCategoryFromMime(mimeType, fileName),
    fileData: parsed?.data || '',
    dataEncoding: parsed ? 'base64' : 'none',
    fileType: mimeType,
    fileSize: size,
    createdAt: now,
    uploadedAt: now,
    downloads: 0,
    views: 0
  };

  await collection.insertOne(doc);

  return {
    success: true,
    id,
    fileName: doc.fileName,
    name: doc.name,
    description: doc.description,
    mimeType: doc.mimeType,
    size: doc.size,
    category: doc.category,
    createdAt: doc.createdAt
  };
}

// Step 2: Generate share link for an already-uploaded file
async function generateShare(req, fileId) {
  const collection = await getCollection();
  const document = await collection.findOne({ id: fileId });
  if (!document) {
    throw new Error('File not found.');
  }

  // Check if share token already exists (no expiry anymore)
  if (document.shareToken) {
    return {
      success: true,
      shareId: fileId,
      shareUrl: getShareUrl(req, fileId),
      file: {
        id: fileId,
        fileName: document.fileName || document.name,
        name: document.name,
        description: document.description,
        mimeType: document.mimeType,
        size: document.size,
        category: document.category,
        createdAt: document.createdAt || document.uploadedAt,
        downloads: document.downloads || 0,
        shareUrl: getShareUrl(req, fileId)
      }
    };
  }

  // Generate share token
  const shareToken = createId();
  await collection.updateOne(
    { id: fileId },
    { $set: { shareToken, sharedAt: new Date() } }
  );

  return {
    success: true,
    shareId: fileId,
    shareUrl: getShareUrl(req, fileId),
    file: {
      id: fileId,
      fileName: document.fileName || document.name,
      name: document.name,
      description: document.description,
      mimeType: document.mimeType,
      size: document.size,
      category: document.category,
      createdAt: document.createdAt || document.uploadedAt,
      downloads: document.downloads || 0,
      shareUrl: getShareUrl(req, fileId)
    }
  };
}

// Legacy function for backward compatibility
async function saveShare(req, payload) {
  const result = await saveFile(req, payload);
  const shareResult = await generateShare(req, result.id);
  return shareResult;
}

async function getShareById(shareId) {
  const collection = await getCollection();
  const document = await collection.findOne({ id: shareId });
  if (!document) return null;
  return {
    id: document.id,
    fileName: document.fileName || document.name,
    name: document.name,
    description: document.description,
    mimeType: document.mimeType,
    size: document.size,
    category: document.category,
    createdAt: document.createdAt || document.uploadedAt,
    downloads: document.downloads || 0,
    shareUrl: `/tools/cloude/share/${document.id}`
  };
}

async function getShareFileById(shareId) {
  const collection = await getCollection();
  const document = await collection.findOne({ id: shareId });
  if (!document) return null;
  return document;
}

async function incrementDownload(shareId) {
  const collection = await getCollection();
  await collection.updateOne({ id: shareId }, { $inc: { downloads: 1 } });
}

async function deleteShare(shareId) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ id: shareId });
  return result.deletedCount > 0;
}

module.exports = {
  saveShare,
  saveFile,
  generateShare,
  getShareById,
  getShareFileById,
  incrementDownload,
  deleteShare
};