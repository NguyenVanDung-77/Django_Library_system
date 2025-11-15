import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Book,
  Schedule,
  CheckCircle,
  Error,
  CalendarToday,
  Refresh
} from '@mui/icons-material';
import borrowService from '../services/borrowService';
import { formatDate, isOverdue, daysSince, formatErrorMessage } from '../utils/helpers';

const MyBorrowsPage = () => {
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);

  useEffect(() => {
    loadBorrowData();
  }, []);

  const loadBorrowData = async () => {
    try {
      setLoading(true);
      setError('');

      const [current, history] = await Promise.all([
        borrowService.getCurrentBorrows(),
        borrowService.getUserBorrowHistory()
      ]);

      // Ensure arrays
      const currentArray = Array.isArray(current) ? current : [];
      const historyArray = Array.isArray(history) ? history : [];
      
      setCurrentBorrows(currentArray);
      
      // Filter history to only show returned books
      const returnedBooks = historyArray.filter(record => record.status === 'returned');
      setBorrowHistory(returnedBooks);

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (record) => {
    try {
      setReturnLoading(record.id);
      setError('');
      setSuccess('');

      await borrowService.returnBook(record.id);
      setSuccess(`Đã trả sách "${record.book_title}" thành công!`);
      
      // Reload data
      await loadBorrowData();

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setReturnLoading(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const BorrowCard = ({ record, showReturnButton = true }) => {
    const overdue = isOverdue(record.due_date);
    const daysOverdue = overdue ? daysSince(record.due_date) : 0;

    return (
      <Card sx={{ mb: 2, border: overdue ? '2px solid' : '1px solid', borderColor: overdue ? 'error.main' : 'divider' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Book sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  {record.book_title || 'Tên sách không xác định'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Ngày mượn: {formatDate(record.borrow_date)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ fontSize: 16, mr: 1, color: overdue ? 'error.main' : 'text.secondary' }} />
                <Typography variant="body2" color={overdue ? 'error.main' : 'text.secondary'}>
                  Ngày trả: {formatDate(record.due_date)}
                  {overdue && ` (Quá hạn ${daysOverdue} ngày)`}
                </Typography>
              </Box>

              {record.return_date && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    Đã trả: {formatDate(record.return_date)}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Chip
                  icon={record.status === 'returned' ? <CheckCircle /> : overdue ? <Error /> : <Schedule />}
                  label={
                    record.status === 'returned' 
                      ? 'Đã trả'
                      : overdue 
                        ? 'Quá hạn'
                        : 'Đang mượn'
                  }
                  color={
                    record.status === 'returned' 
                      ? 'success'
                      : overdue 
                        ? 'error'
                        : 'primary'
                  }
                />

                {showReturnButton && record.status === 'borrowed' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleReturnBook(record)}
                    disabled={returnLoading === record.id}
                    sx={{ mt: 1 }}
                  >
                    {returnLoading === record.id ? 'Đang xử lý...' : 'Trả sách'}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải dữ liệu mượn sách...
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
            Sách đã mượn
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quản lý sách đang mượn và lịch sử mượn trả
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadBorrowData}
          disabled={loading}
        >
          Làm mới
        </Button>
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={`Đang mượn (${currentBorrows.length})`} 
            icon={<Book />}
            iconPosition="start"
          />
          <Tab 
            label={`Lịch sử (${borrowHistory.length})`} 
            icon={<CheckCircle />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {currentBorrows.length > 0 ? (
            currentBorrows.map((record) => (
              <BorrowCard key={record.id} record={record} showReturnButton={true} />
            ))
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              minHeight="300px"
            >
              <Book sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bạn chưa mượn sách nào
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Hãy đến trang danh sách sách để mượn sách yêu thích
              </Typography>
              <Button variant="contained" href="/books" sx={{ mt: 2 }}>
                Xem danh sách sách
              </Button>
            </Box>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {borrowHistory.length > 0 ? (
            borrowHistory.map((record) => (
              <BorrowCard key={record.id} record={record} showReturnButton={false} />
            ))
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              minHeight="300px"
            >
              <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có lịch sử mượn sách
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Khi bạn trả sách, lịch sử sẽ hiển thị tại đây
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default MyBorrowsPage;