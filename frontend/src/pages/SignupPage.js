import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚡ SocialApp</h1>
          <p>Create your account and start posting</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Username"
            fullWidth
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
            variant="outlined"
            size="small"
            inputProps={{ minLength: 3, maxLength: 30 }}
            helperText="3–30 characters"
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Password"
            type={showPwd ? 'text' : 'password'}
            fullWidth
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ py: 1.3, fontSize: '1rem', mt: 0.5 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#65676B', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1877F2', fontWeight: 700, textDecoration: 'none' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
