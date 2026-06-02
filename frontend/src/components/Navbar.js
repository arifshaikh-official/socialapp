import React, { useState } from 'react';
import {
  Avatar, IconButton, Menu, MenuItem, InputBase, Tooltip, Divider
} from '@mui/material';
import { Search, Notifications, Logout, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch?.(val);
  };

  return (
    <nav className="feed-navbar">
      
      <span className="brand">⚡SocialApp</span>

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#F0F2F5', borderRadius: 20, padding: '6px 14px',
        flex: 1, maxWidth: 320
      }}>
        <Search sx={{ color: '#65676B', fontSize: 20 }} />
        <InputBase
          placeholder="Search posts..."
          value={searchVal}
          onChange={handleSearch}
          sx={{ fontSize: '0.875rem', flex: 1 }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ background: '#F0F2F5' }}>
            <Notifications sx={{ fontSize: 22, color: '#65676B' }} />
          </IconButton>
        </Tooltip>

        {/* Avatar / Menu */}
        <Avatar
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #1877F2, #F5A623)',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
          }}
        >
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 3, minWidth: 200, mt: 1 } }}
        >
          <MenuItem disabled sx={{ opacity: '1 !important' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1C1E21' }}>@{user?.username}</div>
              <div style={{ fontSize: '0.78rem', color: '#65676B' }}>{user?.email}</div>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Person sx={{ mr: 1.5, color: '#65676B', fontSize: 20 }} /> Profile
          </MenuItem>
          <MenuItem onClick={() => { logout(); setAnchorEl(null); }} sx={{ color: '#E0245E' }}>
            <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Log Out
          </MenuItem>
        </Menu>
      </div>
    </nav>
  );
}
