const { getDb } = require('../../../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const imageId = req.query?.id;
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
  } catch (error) {
    console.error('Fetch image error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch image' });
  }
};
