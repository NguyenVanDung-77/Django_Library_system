import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  People,
  Book,
  Assignment,
  TrendingUp,
  AdminPanelSettings,
  LibraryBooks
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import bookService from '../services/bookService';
import borrowService from '../services/borrowService';
import { formatErrorMessage, formatDate } from '../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalBorrows: 0,
    activeUsers: 0,
    availableBooks: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load data in parallel
      const [users, books, borrowHistory] = await Promise.all([
        authService.getUsers().catch(() => ({ data: [] })),
        bookService.getBooks().catch(() => []),
        borrowService.getAllBorrowRecords().catch(() => [])
      ]);

      // Process users data
      const usersArray = Array.isArray(users.data) ? users.data : Array.isArray(users) ? users : [];
      const activeUsers = usersArray.filter(u => u.is_active).length;

      // Process books data  
      const booksArray = Array.isArray(books) ? books : [];
      const availableBooks = booksArray.filter(book => book.available_copies > 0).length;

      // Process borrows data
      console.log('Raw borrow history:', borrowHistory);
      const borrowsArray = Array.isArray(borrowHistory) ? borrowHistory : [];
      console.log('Processed borrows array:', borrowsArray);
      const activeBorrows = borrowsArray.filter(b => b.status === 'borrowed').length;
      console.log('Active borrows count:', activeBorrows);

      setStats({
        totalUsers: usersArray.length,
        totalBooks: booksArray.length,
        totalBorrows: activeBorrows,
        activeUsers: activeUsers,
        availableBooks: availableBooks
      });

      // Recent users (last 5)
      setRecentUsers(usersArray.slice(-5).reverse());

      // Recent borrow records (last 5)
      setRecentBorrows(borrowsArray.slice(-5).reverse());

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="h6" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải dữ liệu admin dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Xin chào {user?.first_name || user?.username}! Quản lý hệ thống thư viện
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People />}
            title="Tổng người dùng"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} đang hoạt động`}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LibraryBooks />}
            title="Tổng sách"
            value={stats.totalBooks}
            subtitle={`${stats.availableBooks} có sẵn`}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assignment />}
            title="Đang cho mượn"
            value={stats.totalBorrows}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Tỷ lệ sử dụng"
            value={stats.totalBooks > 0 ? `${Math.round((stats.totalBorrows / stats.totalBooks) * 100)}%` : '0%'}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Data Tables */}
      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Người dùng mới nhất
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role === 'admin' ? 'Admin' : user.role === 'librarian' ? 'Thủ thư' : 'Độc giả'}
                            color={user.role === 'admin' ? 'error' : user.role === 'librarian' ? 'warning' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Borrow Records */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động mượn/trả gần đây
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sách</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBorrows.length > 0 ? (
                    recentBorrows.map((borrow, index) => (
                      <TableRow key={borrow.id || index}>
                        <TableCell>
                          {borrow.book_title || 'Không xác định'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={borrow.status === 'borrowed' ? 'Đang mượn' : 'Đã trả'}
                            color={borrow.status === 'borrowed' ? 'primary' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(borrow.return_date || borrow.borrow_date)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Không có hoạt động
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thao tác nhanh
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="Quản lý người dùng" 
            onClick={() => window.location.href = '/admin/users'}
            clickable
            color="primary"
            icon={<People />}
          />
          <Chip 
            label="Quản lý sách" 
            onClick={() => window.location.href = '/admin/books'}
            clickable
            color="secondary"
            icon={<Book />}
          />
          <Chip 
            label="Quản lý mượn/trả" 
            onClick={() => window.location.href = '/admin/borrows'}
            clickable
            color="success"
            icon={<Assignment />}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;