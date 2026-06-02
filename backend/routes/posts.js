const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'latest';
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort === 'mostLiked') sortObj = { 'likes': -1, createdAt: -1 };
    if (sort === 'mostCommented') sortObj = { createdAt: -1 };

    let posts;
    if (sort === 'mostLiked') {
      posts = await Post.aggregate([
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip }, { $limit: limit }
      ]);
    } else if (sort === 'mostCommented') {
      posts = await Post.aggregate([
        { $addFields: { commentsCount: { $size: '$comments' } } },
        { $sort: { commentsCount: -1, createdAt: -1 } },
        { $skip: skip }, { $limit: limit }
      ]);
    } else {
      posts = await Post.find().sort(sortObj).skip(skip).limit(limit).lean();
    }

    const total = await Post.countDocuments();
    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text, tags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!text && !imageUrl)
      return res.status(400).json({ message: 'Post must have text or image' });

    const post = await Post.create({
      author: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      text: text || '',
      image: imageUrl,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      text
    });
    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
