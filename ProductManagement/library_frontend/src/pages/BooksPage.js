import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { Search, FilterList, Refresh } from '@mui/icons-material';
import BookCard from '../components/BookCard';
import bookService from '../services/bookService';
import borrowService from '../services/borrowService';
import { debounce, formatErrorMessage } from '../utils/helpers';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterAndSearchBooks();
  }, [books, searchTerm, filterBy, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookService.getBooks();
      setBooks(data);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchBooks = () => {
    let filtered = [...books];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term) ||
        book.publisher?.toLowerCase().includes(term)
      );
    }

    // Filter
    switch (filterBy) {
      case 'available':
        filtered = filtered.filter(book => book.available_copies > 0);
        break;
      case 'unavailable':
        filtered = filtered.filter(book => book.available_copies === 0);
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return (b.publication_year || 0) - (a.publication_year || 0);
        case 'available':
          return b.available_copies - a.available_copies;
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Debounced search
  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleBorrowBook = async (book) => {
    try {
      setBorrowLoading(book.id);
      setError('');
      setSuccess('');

      await borrowService.borrowBook({
        book_id: book.id
      });

      setSuccess(`Đã mượn sách "${book.title}" thành công!`);
      
      // Reload books để cập nhật available_copies
      await loadBooks();
      
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setBorrowLoading(null);
    }
  };

  const handleViewDetails = (book) => {
    // TODO: Navigate to book details page or open modal
    console.log('View book details:', book);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Đang tải danh sách sách...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Danh sách sách
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Tìm kiếm và mượn sách từ thư viện
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

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm sách, tác giả, ISBN..."
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo</InputLabel>
              <Select
                value={filterBy}
                label="Lọc theo"
                onChange={(e) => setFilterBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Tất cả sách</MenuItem>
                <MenuItem value="available">Có sẵn</MenuItem>
                <MenuItem value="unavailable">Hết sách</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="title">Tên sách A-Z</MenuItem>
                <MenuItem value="author">Tác giả A-Z</MenuItem>
                <MenuItem value="year">Năm xuất bản</MenuItem>
                <MenuItem value="available">Tình trạng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Refresh />}
              onClick={loadBooks}
              disabled={loading}
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {currentBooks.length} / {filteredBooks.length} sách
          {searchTerm && ` cho "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Books Grid */}
      {currentBooks.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }} alignItems="stretch">
            {currentBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={book.id} sx={{ display: 'flex' }}>
                <BookCard
                  book={book}
                  onBorrow={handleBorrowBook}
                  onViewDetails={handleViewDetails}
                  isLoading={borrowLoading === book.id}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="300px"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy sách nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm 
              ? `Không có kết quả cho "${searchTerm}"`
              : 'Danh sách sách trống'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadBooks}
            sx={{ mt: 2 }}
          >
            Tải lại
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BooksPage;