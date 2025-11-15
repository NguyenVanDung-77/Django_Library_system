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
  Fab,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  Book,
  Visibility,
  FilterList
} from '@mui/icons-material';
import bookService from '../services/bookService';
import { formatErrorMessage } from '../utils/helpers';

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publication_year: '',
    total_copies: '',
    description: ''
  });

  const categories = [
    'Khoa học', 'Văn học', 'Lịch sử', 'Triết học', 'Kỹ thuật',
    'Y học', 'Luật pháp', 'Kinh tế', 'Nghệ thuật', 'Thể thao',
    'Giáo dục', 'Tâm lý học', 'Khác'
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookService.getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publication_year: '',
      total_copies: '',
      description: ''
    });
  };

  const handleAddBook = () => {
    setDialogMode('add');
    resetForm();
    setOpenDialog(true);
  };

  const handleEditBook = (book) => {
    setDialogMode('edit');
    setSelectedBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || '',
      total_copies: book.total_copies || '',
      description: book.description || ''
    });
    setOpenDialog(true);
  };

  const handleViewBook = (book) => {
    setDialogMode('view');
    setSelectedBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || '',
      total_copies: book.total_copies || '',
      description: book.description || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      
      console.log('🚀 Starting book creation with data:', formData);

      if (dialogMode === 'add') {
        console.log('📚 Calling bookService.createBook...');
        const result = await bookService.createBook(formData);
        console.log('✅ Book creation result:', result);
        setSuccess('Thêm sách thành công!');
      } else if (dialogMode === 'edit') {
        console.log('📝 Calling bookService.updateBook...');
        await bookService.updateBook(selectedBook.id, formData);
        setSuccess('Cập nhật sách thành công!');
      }

      setOpenDialog(false);
      await loadBooks();
    } catch (err) {
      console.error('❌ Book operation failed:', err);
      console.error('Error details:', err);
      setError(formatErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setError('');
      setSuccess('');
      await bookService.deleteBook(selectedBook.id);
      setSuccess('Xóa sách thành công!');
      setDeleteDialogOpen(false);
      await loadBooks();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  };

  // Filter and search logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    
    const matchesAvailability = 
      !availabilityFilter || 
      (availabilityFilter === 'available' && book.available_copies > 0) ||
      (availabilityFilter === 'unavailable' && book.available_copies === 0);
    
    return matchesSearch && matchesCategory && matchesAvailability;
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
          Đang tải dữ liệu sách...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          <Book sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quản lý Sách
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBook}
          size="large"
        >
          Thêm sách mới
        </Button>
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

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, tác giả, ISBN..."
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
              <InputLabel>Thể loại</InputLabel>
              <Select
                value={categoryFilter}
                label="Thể loại"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tình trạng</InputLabel>
              <Select
                value={availabilityFilter}
                label="Tình trạng"
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="available">Có sẵn</MenuItem>
                <MenuItem value="unavailable">Hết sách</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setAvailabilityFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Books Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên sách</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>ISBN</TableCell>
                <TableCell>Thể loại</TableCell>
                <TableCell>Năm xuất bản</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Tình trạng</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>{book.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {book.title}
                      </Typography>
                      {book.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {book.description.length > 50 ? 
                            `${book.description.substring(0, 50)}...` : 
                            book.description
                          }
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>
                      <Chip label={book.category} size="small" />
                    </TableCell>
                    <TableCell>{book.publication_year}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>{book.available_copies}</strong> / {book.total_copies}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.available_copies > 0 ? 'Có sẵn' : 'Hết sách'}
                        color={book.available_copies > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewBook(book)}
                          color="info"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditBook(book)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBook(book)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredBooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Không tìm thấy sách nào
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
          count={filteredBooks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>

      {/* Add/Edit Book Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' && 'Thêm sách mới'}
          {dialogMode === 'edit' && 'Chỉnh sửa thông tin sách'}
          {dialogMode === 'view' && 'Chi tiết sách'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên sách"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tác giả"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={dialogMode === 'view'}>
                <InputLabel>Thể loại</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Thể loại"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Năm xuất bản"
                name="publication_year"
                type="number"
                value={formData.publication_year}
                onChange={handleInputChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tổng số bản"
                name="total_copies"
                type="number"
                value={formData.total_copies}
                onChange={handleInputChange}
                required
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nhà xuất bản"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa sách</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa sách "{selectedBook?.title}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleAddBook}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default AdminBooksPage;