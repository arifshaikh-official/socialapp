import React, { useState, useRef } from 'react';
import {
  Avatar, Button, IconButton, TextField, CircularProgress
} from '@mui/material';
import {
  CameraAlt, EmojiEmotions, Close, Send
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      toast.warning('Add some text or image!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPostCreated(res.data);
      setText('');
      removeImage();
      setFocused(false);
      toast.success('Post created! +100 points 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="create-post-card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar className="post-avatar" sx={{ mt: 0.5 }}>{initials}</Avatar>
        <div style={{ flex: 1 }}>
          <TextField
            placeholder="What's on your mind?"
            multiline
            minRows={focused ? 3 : 1}
            maxRows={8}
            fullWidth
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: '#F0F2F5',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: '2px solid #1877F2' }
              }
            }}
            inputProps={{ maxLength: 1000 }}
          />

          {imagePreview && (
            <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
              <img src={imagePreview} alt="preview" style={{
                maxHeight: 200, maxWidth: '100%', borderRadius: 10, display: 'block'
              }} />
              <IconButton
                size="small"
                onClick={removeImage}
                sx={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  '&:hover': { background: 'rgba(0,0,0,0.8)' }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </div>
          )}

          {(focused || text || imagePreview) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  style={{ display: 'none' }}
                  onChange={handleImage}
                />
                <IconButton size="small" onClick={() => fileRef.current.click()} sx={{ color: '#45BD62' }}>
                  <CameraAlt />
                </IconButton>
                
              </div>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || (!text.trim() && !imageFile)}
                endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                sx={{ borderRadius: 3, px: 2.5 }}
              >
                Post
              </Button>
            </div>
          )}

          {!focused && !text && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              <IconButton size="small" onClick={() => { fileRef.current.click(); setFocused(true); }} sx={{ color: '#45BD62' }}>
                <CameraAlt />
              </IconButton>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleImage} />
              <IconButton size="small" onClick={() => setFocused(true)} sx={{ color: '#F7B928' }}>
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
