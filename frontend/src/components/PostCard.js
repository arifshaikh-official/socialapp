import React, { useState } from 'react';
import { Avatar, IconButton, TextField, Button, Collapse } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline, Share, Delete, Send } from '@mui/icons-material';
import { format } from 'timeago.js';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const isLiked = post.likes?.includes(user?._id);
  const isOwner = post.author === user?._id || post.author?._id === user?._id;

  const handleLike = async () => {
    if (!user || likePending) return;
    setLikePending(true);
    // Optimistic update
    const wasLiked = post.likes?.includes(user._id);
    const newLikes = wasLiked
      ? post.likes.filter(id => id !== user._id)
      : [...(post.likes || []), user._id];
    onUpdate({ ...post, likes: newLikes });

    try {
      const res = await api.put(`/posts/${post._id}/like`);
      onUpdate({ ...post, likes: res.data.likes });
    } catch {
      onUpdate(post); // revert
      toast.error('Could not update like');
    } finally {
      setLikePending(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText.trim() });
      onUpdate({ ...post, comments: res.data });
      setCommentText('');
    } catch {
      toast.error('Could not add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.info('Link copied!');
  };

  const initials = post.username?.[0]?.toUpperCase() || '?';
  const imageUrl = post.image ? `${API_BASE}${post.image}` : '';

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar className="post-avatar">{initials}</Avatar>
        <div style={{ flex: 1 }}>
          <div className="post-username">@{post.username}</div>
          <div className="post-time">{format(post.createdAt)}</div>
        </div>
        {isOwner && (
          <IconButton size="small" onClick={handleDelete} sx={{ color: '#65676B' }}>
            <Delete fontSize="small" />
          </IconButton>
        )}
      </div>

      {/* Content */}
      {post.text && <p className="post-text">{post.text}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="post" className="post-image" />
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="post-tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderTop: '1px solid #E4E6EA', borderBottom: '1px solid #E4E6EA', marginBottom: 4 }}>
        <span style={{ fontSize: '0.82rem', color: '#65676B', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Favorite sx={{ fontSize: 14, color: '#E0245E' }} /> {post.likes?.length || 0}
        </span>
        <span style={{ fontSize: '0.82rem', color: '#65676B', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChatBubbleOutline sx={{ fontSize: 14 }} /> {post.comments?.length || 0} comments
        </span>
      </div>

      {/* Action buttons */}
      <div className="post-actions">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? <Favorite sx={{ fontSize: 20 }} /> : <FavoriteBorder sx={{ fontSize: 20 }} />}
          {isLiked ? 'Liked' : 'Like'}
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <ChatBubbleOutline sx={{ fontSize: 20 }} />
          Comment
        </button>
        <button className="action-btn" onClick={handleShare}>
          <Share sx={{ fontSize: 20 }} />
          Share
        </button>
      </div>

      {/* Comments */}
      <Collapse in={showComments}>
        <div className="comments-section">
          {/* Comment input */}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1877F2,#F5A623)', fontSize: '0.8rem', fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <TextField
              size="small"
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 6,
                  background: '#F0F2F5',
                  '& fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '2px solid #1877F2' }
                }
              }}
              inputProps={{ maxLength: 500 }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment(e)}
            />
            <IconButton type="submit" size="small" disabled={!commentText.trim() || submittingComment} sx={{ color: '#1877F2' }}>
              <Send />
            </IconButton>
          </form>

          {/* Existing comments */}
          {post.comments?.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#65676B', textAlign: 'center', padding: '8px 0' }}>
              No comments yet. Be the first!
            </p>
          )}
          {post.comments?.slice().reverse().map(comment => (
            <div key={comment._id} className="comment-item">
              <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1877F2,#F5A623)', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                {comment.username?.[0]?.toUpperCase()}
              </Avatar>
              <div className="comment-bubble">
                <div className="comment-username">@{comment.username}</div>
                <div className="comment-text">{comment.text}</div>
                <div style={{ fontSize: '0.72rem', color: '#65676B', marginTop: 3 }}>{format(comment.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
}
