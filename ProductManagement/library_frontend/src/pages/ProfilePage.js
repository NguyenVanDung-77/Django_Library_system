import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, formatErrorMessage } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to original user data
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || ''
    });
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      return 'Vui lòng điền đầy đủ các trường bắt buộc';
    }

    if (!isValidEmail(formData.email)) {
      return 'Email không hợp lệ';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await updateUser(user.id, formData);
      setSuccess('Cập nhật thông tin thành công!');
      setEditing(false);
      
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thông tin cá nhân
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Quản lý thông tin tài khoản của bạn
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <AccountCircle sx={{ fontSize: 60 }} />
                )}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {user.first_name} {user.last_name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {user.role === 'admin' ? 'Quản trị viên' : 
                 user.role === 'librarian' ? 'Thủ thư' : 'Độc giả'}
              </Typography>

              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color={user.is_active ? 'success.main' : 'error.main'}>
                  Trạng thái: {user.is_active ? 'Đang hoạt động' : 'Bị khóa'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Thông tin chi tiết
              </Typography>
              
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  required
                  InputProps={{
                    startAdornment: !editing && (
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  required
                  InputProps={{
                    startAdornment: !editing && (
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  required
                  InputProps={{
                    startAdornment: !editing && (
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  InputProps={{
                    startAdornment: !editing && (
                      <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              {/* Read-only fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={user.username}
                  disabled
                  helperText="Username không thể thay đổi"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vai trò"
                  value={user.role === 'admin' ? 'Quản trị viên' : 
                        user.role === 'librarian' ? 'Thủ thư' : 'Độc giả'}
                  disabled
                  helperText="Vai trò được cấp bởi quản trị viên"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;