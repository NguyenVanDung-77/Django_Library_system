import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Chip,
  LinearProgress,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  Assignment,
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Warning,
  TrendingUp,
  LibraryBooks,
  People
} from '@mui/icons-material';
import borrowService from '../services/borrowService';
import bookService from '../services/bookService';
import authService from '../services/authService';
import { formatErrorMessage, formatDate } from '../utils/helpers';

const AdminBorrowsPage = () => {
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalBorrows: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    returnedBorrows: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all data in parallel
      const [borrowsData, booksData, usersData] = await Promise.all([
        borrowService.getAllBorrowRecords().catch(() => []),
        bookService.getBooks().catch(() => []),
        authService.getUsers().then(response => 
          Array.isArray(response.data) ? response.data : 
          Array.isArray(response) ? response : []
        ).catch(() => [])
      ]);

      console.log('Admin Borrows - Raw data:', borrowsData);
      const borrowsArray = Array.isArray(borrowsData) ? borrowsData : [];
      console.log('Admin Borrows - Processed array:', borrowsArray);
      setBorrows(borrowsArray);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setUsers(usersData);

      // Calculate statistics
      const activeBorrows = borrowsArray.filter(b => b.status === 'borrowed').length;
      const returnedBorrows = borrowsArray.filter(b => b.status === 'returned').length;
      
      // Calculate overdue (assuming 14 days loan period)
      const today = new Date();
      const overdueBorrows = borrowsArray.filter(b => {
        if (b.status !== 'borrowed') return false;
        const borrowDate = new Date(b.borrow_date);
        const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        return today > dueDate;
      }).length;

      setStats({
        totalBorrows: borrowsArray.length,
        activeBorrows,
        overdueBorrows,
        returnedBorrows
      });

    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewBorrow = (borrow) => {
    setSelectedBorrow(borrow);
    setOpenDialog(true);
  };

  const handleReturnBook = async (borrowId) => {
    try {
      setError('');
      setSuccess('');
      await borrowService.returnBook(borrowId);
      setSuccess('Trả sách thành công!');
      await loadAllData();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  };

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId);
    return book?.title || `Book ID: ${bookId}`;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.username || `User ID: ${userId}`;
  };

  const getStatusColor = (status, borrowDate) => {
    if (status === 'returned') return 'success';
    if (status === 'borrowed') {
      // Check if overdue
      const today = new Date();
      const borrow = new Date(borrowDate);
      const dueDate = new Date(borrow.getTime() + 14 * 24 * 60 * 60 * 1000);
      return today > dueDate ? 'error' : 'primary';
    }
    return 'default';
  };

  const getStatusLabel = (status, borrowDate) => {
    if (status === 'returned') return 'Đã trả';
    if (status === 'borrowed') {
      const today = new Date();
      const borrow = new Date(borrowDate);
      const dueDate = new Date(borrow.getTime() + 14 * 24 * 60 * 60 * 1000);
      return today > dueDate ? 'Quá hạn' : 'Đang mượn';
    }
    return status;
  };

  const getDueDate = (borrowDate) => {
    const borrow = new Date(borrowDate);
    const dueDate = new Date(borrow.getTime() + 14 * 24 * 60 * 60 * 1000);
    return dueDate.toLocaleDateString('vi-VN');
  };

  // Filter and search logic
  const filteredBorrows = borrows.filter(borrow => {
    const bookTitle = getBookTitle(borrow.book_id);
    const userName = getUserName(borrow.user_id);
    
    const matchesSearch = 
      bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !statusFilter || borrow.status === statusFilter ||
      (statusFilter === 'overdue' && 
       borrow.status === 'borrowed' && 
       new Date() > new Date(new Date(borrow.borrow_date).getTime() + 14 * 24 * 60 * 60 * 1000));
    
    const matchesDate = !dateFilter || 
      borrow.borrow_date?.includes(dateFilter) ||
      borrow.return_date?.includes(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải dữ liệu mượn/trả sách...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quản lý Mượn/Trả Sách
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalBorrows}
                  </Typography>
                  <Typography color="text.secondary">
                    Tổng lượt mượn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LibraryBooks sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.activeBorrows}
                  </Typography>
                  <Typography color="text.secondary">
                    Đang mượn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ color: 'error.main', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.overdueBorrows}
                  </Typography>
                  <Typography color="text.secondary">
                    Quá hạn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.returnedBorrows}
                  </Typography>
                  <Typography color="text.secondary">
                    Đã trả
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên sách, người mượn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="borrowed">Đang mượn</MenuItem>
                <MenuItem value="returned">Đã trả</MenuItem>
                <MenuItem value="overdue">Quá hạn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Lọc theo ngày"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Borrows Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Người mượn</TableCell>
                <TableCell>Tên sách</TableCell>
                <TableCell>Ngày mượn</TableCell>
                <TableCell>Hạn trả</TableCell>
                <TableCell>Ngày trả</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBorrows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((borrow) => (
                  <TableRow key={borrow.id} hover>
                    <TableCell>{borrow.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                        {getUserName(borrow.user_id)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {getBookTitle(borrow.book_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(borrow.borrow_date)}</TableCell>
                    <TableCell>
                      {borrow.status === 'borrowed' ? getDueDate(borrow.borrow_date) : '-'}
                    </TableCell>
                    <TableCell>
                      {borrow.return_date ? formatDate(borrow.return_date) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(borrow.status, borrow.borrow_date)}
                        color={getStatusColor(borrow.status, borrow.borrow_date)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewBorrow(borrow)}
                          color="info"
                        >
                          <Visibility />
                        </IconButton>
                        {borrow.status === 'borrowed' && (
                          <IconButton
                            size="small"
                            onClick={() => handleReturnBook(borrow.id)}
                            color="success"
                            title="Xác nhận trả sách"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredBorrows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Không tìm thấy dữ liệu mượn/trả nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredBorrows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>

      {/* View Borrow Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Chi tiết mượn/trả sách</DialogTitle>
        <DialogContent>
          {selectedBorrow && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID"
                  value={selectedBorrow.id}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Người mượn"
                  value={getUserName(selectedBorrow.user_id)}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sách"
                  value={getBookTitle(selectedBorrow.book_id)}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày mượn"
                  value={formatDate(selectedBorrow.borrow_date)}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày trả"
                  value={selectedBorrow.return_date ? formatDate(selectedBorrow.return_date) : 'Chưa trả'}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hạn trả"
                  value={selectedBorrow.status === 'borrowed' ? getDueDate(selectedBorrow.borrow_date) : '-'}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trạng thái"
                  value={getStatusLabel(selectedBorrow.status, selectedBorrow.borrow_date)}
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Đóng
          </Button>
          {selectedBorrow?.status === 'borrowed' && (
            <Button 
              onClick={() => {
                handleReturnBook(selectedBorrow.id);
                setOpenDialog(false);
              }} 
              color="success" 
              variant="contained"
            >
              Xác nhận trả sách
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBorrowsPage;