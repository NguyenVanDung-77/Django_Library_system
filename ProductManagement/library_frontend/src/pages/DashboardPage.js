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
  Alert
} from '@mui/material';
import {
  Book,
  LibraryBooks,
  Schedule,
  Assignment,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import borrowService from '../services/borrowService';
import bookService from '../services/bookService';
import { formatErrorMessage } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    currentBorrows: 0,
    totalBooks: 0,
    overdueBooks: 0,
    availableBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load parallel data
      const [currentBorrows, allBooks, userHistory] = await Promise.all([
        borrowService.getCurrentBorrows().catch(() => []),
        bookService.getBooks().catch(() => []),
        borrowService.getUserBorrowHistory().catch(() => [])
      ]);

      // Ensure allBooks is an array
      const booksArray = Array.isArray(allBooks) ? allBooks : [];
      
      // Calculate stats
      const availableBooks = booksArray.filter(book => book.available_copies > 0).length;
      const overdueBooks = currentBorrows.filter(borrow => {
        const dueDate = new Date(borrow.due_date);
        return new Date() > dueDate;
      }).length;

      setStats({
        currentBorrows: Array.isArray(currentBorrows) ? currentBorrows.length : 0,
        totalBooks: booksArray.length,
        overdueBooks: overdueBooks,
        availableBooks: availableBooks
      });

      // Recent activity (last 5 records) - ensure it's an array
      const historyArray = Array.isArray(userHistory) ? userHistory : [];
      setRecentActivity(historyArray.slice(0, 5));

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color = 'primary', progress }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {progress !== undefined && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải dữ liệu dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Xin chào, {user?.first_name || user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Chào mừng bạn đến với hệ thống quản lý thư viện
        </Typography>
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
            icon={<LibraryBooks />}
            title="Sách đang mượn"
            value={stats.currentBorrows}
            color="primary"
            progress={stats.currentBorrows > 0 ? (stats.currentBorrows / 5) * 100 : 0}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Book />}
            title="Tổng số sách"
            value={stats.totalBooks}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assignment />}
            title="Sách có sẵn"
            value={stats.availableBooks}
            color="success"
            progress={stats.totalBooks > 0 ? (stats.availableBooks / stats.totalBooks) * 100 : 0}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Schedule />}
            title="Sách quá hạn"
            value={stats.overdueBooks}
            color={stats.overdueBooks > 0 ? "error" : "success"}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="h2">
                Hoạt động gần đây
              </Typography>
            </Box>
            
            {recentActivity.length > 0 ? (
              <Box>
                {recentActivity.map((activity, index) => (
                  <Box 
                    key={activity.id || index}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentActivity.length - 1 ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        {activity.book_title || 'Sách không xác định'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.status === 'borrowed' ? 'Đã mượn' : 
                         activity.status === 'returned' ? 'Đã trả' : activity.status}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(activity.borrow_date).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Chưa có hoạt động nào
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Thông tin tài khoản
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Họ tên: {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Email: {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Username: {user?.username}
              </Typography>
              {user?.phone_number && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Điện thoại: {user.phone_number}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;