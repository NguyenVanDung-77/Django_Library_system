import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Refresh,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import authService from '../services/authService';
import { formatDate, formatErrorMessage } from '../utils/helpers';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getUsers();
      const usersArray = data.data || data || [];
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setError('');
      setSuccess('');
      await authService.deleteUser(userId);
      setSuccess('Đã xóa user thành công!');
      setDeleteDialog({ open: false, user: null });
      await loadUsers();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', color: 'error' },
      librarian: { label: 'Thủ thư', color: 'warning' },
      reader: { label: 'Độc giả', color: 'primary' }
    };
    
    const config = roleConfig[role] || { label: role, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải danh sách người dùng...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Quản lý người dùng
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý tài khoản và phân quyền người dùng
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* TODO: Add create user */}}
          >
            Thêm người dùng
          </Button>
        </Box>
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

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={user.is_active ? <CheckCircle /> : <Cancel />}
                      label={user.is_active ? 'Hoạt động' : 'Bị khóa'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {/* TODO: Edit user */}}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, user })}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu người dùng
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Xóa người dùng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng "{deleteDialog.user?.username}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Hủy
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => handleDeleteUser(deleteDialog.user?.id)}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary Stats */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Chip 
          label={`Tổng: ${users.length} người dùng`} 
          color="primary" 
        />
        <Chip 
          label={`Admin: ${users.filter(u => u.role === 'admin').length}`} 
          color="error" 
        />
        <Chip 
          label={`Thủ thư: ${users.filter(u => u.role === 'librarian').length}`} 
          color="warning" 
        />
        <Chip 
          label={`Độc giả: ${users.filter(u => u.role === 'reader').length}`} 
          color="success" 
        />
      </Box>
    </Container>
  );
};

export default AdminUsersPage;