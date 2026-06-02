const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  text: { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  text: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { timestamps: true });

// At least one of text or image must be present
postSchema.pre('save', function (next) {
  if (!this.text && !this.image) {
    return next(new Error('Post must have text or image'));
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
