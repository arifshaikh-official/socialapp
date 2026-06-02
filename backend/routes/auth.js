const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });


router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: 'Email or username already taken' });

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, points: user.points }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar, points: user.points }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
