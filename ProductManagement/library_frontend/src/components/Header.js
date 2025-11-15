import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Notifications,
  Book,
  LibraryBooks,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <LibraryBooks />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Chào Mừng đến Hệ Thống Quản Lý Thư Viện 
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Navigation Buttons */}
            <Button 
              color="inherit" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<Book />}
              onClick={() => navigate('/books')}
            >
              Sách
            </Button>

            <Button 
              color="inherit" 
              startIcon={<LibraryBooks />}
              onClick={() => navigate('/my-borrows')}
            >
              Sách Đã Mượn
            </Button>

            {/* Admin only features */}
            {user?.role === 'admin' && (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Admin Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin/users')}
                >
                  Quản lý Users
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin/books')}
                >
                  Quản lý Sách
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin/borrows')}
                >
                  Quản lý Mượn/Trả
                </Button>
              </>
            )}

            {/* Notifications */}
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              {user?.avatar ? (
                <Avatar 
                  src={user.avatar} 
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Typography variant="body2" color="textSecondary">
                  Xin chào, {user?.first_name || user?.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleProfile}>Thông tin cá nhân</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Đăng ký
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;