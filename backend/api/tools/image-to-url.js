const { getDb } = require('../_lib/db');
const { requireUser } = require('../_lib/require-user');

function generateShortId() {
  return Math.random().toString(36).slice(2, 11);
}

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');

  const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
  return host ? `${proto}://${host}` : 'https://amertak-tools.vercel.app';
}

function getSubPath(req) {
  const rawPath = req.originalUrl || req.url || '/';
  const pathname = new URL(rawPath, 'http://localhost').pathname;
  return pathname.replace(/^\/api\/tools\/image-to-url/, '') || '/';
}

async function createImage(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const { image, fileName, description, imageSize } = req.body || {};

  if (!image || !fileName) {
    res.status(400).json({ message: 'Image and fileName are required' });
    return;
  }

  const db = await getDb();
  const imageId = generateShortId();
  const imageDoc = {
    _id: imageId,
    fileName,
    description: description || fileName,
    imageData: image,
    imageSize,
    uploadedAt: new Date(),
    views: 0,
    userId: user.id
  };

  await db.collection('images').insertOne(imageDoc);

  res.status(200).json({
    success: true,
    imageId,
    shareUrl: `${getBaseUrl(req)}/share/${imageId}`,
    message: 'Image uploaded successfully'
  });
}

async function getImage(req, res, imageId) {
  if (!imageId) {
    res.status(400).json({ message: 'Image ID is required' });
    return;
  }

  const db = await getDb();
  const image = await db.collection('images').findOne({ _id: imageId });

  if (!image) {
    res.status(404).json({ message: 'Image not found' });
    return;
  }

  await db.collection('images').updateOne(
    { _id: imageId },
    { $inc: { views: 1 } }
  );

  res.status(200).json({
    success: true,
    image: {
      id: image._id,
      fileName: image.fileName,
      description: image.description,
      imageData: image.imageData,
      views: (image.views || 0) + 1,
      uploadedAt: image.uploadedAt
    }
  });
}

async function imageToUrlHandler(req, res) {
  try {
    const subPath = getSubPath(req);
    const imageMatch = subPath.match(/^\/image\/([^/]+)$/);

    if (req.method === 'POST' && subPath === '/') {
      await createImage(req, res);
      return;
    }

    if (req.method === 'GET' && imageMatch) {
      await getImage(req, res, imageMatch[1]);
      return;
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Image to URL API error:', error);
    res.status(500).json({ message: error.message || 'Image to URL request failed' });
  }
}

module.exports = imageToUrlHandler;
