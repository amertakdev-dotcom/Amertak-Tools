const express = require('express');
const { requireUser } = require('../_lib/require-user');
const { getDb } = require('../_lib/db');

const router = express.Router();

// GET /api/tools/:toolId/likes - Get like count and user's like status
router.get('/:toolId/likes', async (req, res) => {
  try {
    const { toolId } = req.params;
    const db = await getDb();
    const likesCollection = db.collection('toolLikes');

    // Get total like count
    const likeCount = await likesCollection.countDocuments({ toolId });

    // Check if current user has liked this tool
    const user = await requireUser(req, res);
    let likedByUser = false;
    
    if (user) {
      const existingLike = await likesCollection.findOne({
        userId: user.id,
        toolId: toolId
      });
      likedByUser = !!existingLike;
    }

    res.status(200).json({
      likes: likeCount,
      likedByUser: likedByUser
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ message: 'Failed to fetch likes', error: error.message });
  }
});

// POST /api/tools/:toolId/like - Like a tool (requires authentication)
router.post('/:toolId/like', async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    const { toolId } = req.params;
    const db = await getDb();
    const likesCollection = db.collection('toolLikes');

    // Check if user already liked this tool
    const existingLike = await likesCollection.findOne({
      userId: user.id,
      toolId: toolId
    });

    if (existingLike) {
      res.status(400).json({
        success: false,
        message: 'You have already liked this tool',
        likes: await likesCollection.countDocuments({ toolId }),
        likedByUser: true
      });
      return;
    }

    // Add like
    await likesCollection.insertOne({
      userId: user.id,
      toolId: toolId,
      createdAt: new Date()
    });

    const updatedCount = await likesCollection.countDocuments({ toolId });

    res.status(200).json({
      success: true,
      likes: updatedCount,
      likedByUser: true
    });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ message: 'Failed to add like', error: error.message });
  }
});

// DELETE /api/tools/:toolId/like - Unlike a tool (requires authentication)
router.delete('/:toolId/like', async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    const { toolId } = req.params;
    const db = await getDb();
    const likesCollection = db.collection('toolLikes');

    // Remove like
    const result = await likesCollection.deleteOne({
      userId: user.id,
      toolId: toolId
    });

    const updatedCount = await likesCollection.countDocuments({ toolId });

    res.status(200).json({
      success: true,
      likes: updatedCount,
      likedByUser: false
    });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ message: 'Failed to remove like', error: error.message });
  }
});

module.exports = router;