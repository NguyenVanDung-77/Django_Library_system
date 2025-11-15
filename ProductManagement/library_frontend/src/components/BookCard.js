import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CardMedia
} from '@mui/material';
import {
  Book,
  Person,
  CalendarToday,
  LocationOn
} from '@mui/icons-material';

const BookCard = ({
  book,
  onBorrow,
  onViewDetails,
  showBorrowButton = true,
  isLoading = false
}) => {
  const isAvailable = book.available_copies > 0;

  return (
    <Card
      sx={{
        width: '100%',
        height: 420,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Book Cover Image */}
      <CardMedia
        component="div"
        sx={{
          height: 180,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(1px)'
          }
        }}
      >
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Book sx={{ fontSize: 80, color: 'rgba(255,255,255,0.9)', zIndex: 1 }} />
        )}
      </CardMedia>

      {/* Card Content */}
      <CardContent
        sx={{
          p: 2,
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, // QUAN TRỌNG: chiếm toàn bộ không gian còn lại
          overflow: 'hidden',
          minHeight: 0 // đảm bảo flex không bị phá
        }}
      >
        {/* Nội dung chính */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
          {/* Title */}
          <Typography
            variant="h6"
            title={book.title}
            sx={{
              fontWeight: 600,
              mb: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '1.1rem',
              lineHeight: 1.2,
              color: 'text.primary'
            }}
          >
            {book.title}
          </Typography>

          {/* Metadata */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Person sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, fontSize: '0.85rem' }} noWrap>
                {book.author}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {book.publication_year && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {book.publication_year}
                  </Typography>
                </Box>
              )}
              {book.publisher && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }} noWrap>
                    {book.publisher}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.1,
              fontSize: '0.875rem'
            }}
            title={book.description || 'Chưa có mô tả'}
          >
            {book.description || 'Chưa có mô tả'}
          </Typography>

          {/* Availability */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 0.75,
              bgcolor: isAvailable ? 'success.light' : 'error.light',
              borderRadius: 1,
              height: 36,
              mt: 'auto'
            }}
          >
            <Chip
              label={isAvailable ? 'Có sẵn' : 'Hết sách'}
              color={isAvailable ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isAvailable ? 'success.dark' : 'error.dark',
                fontSize: '0.85rem'
              }}
            >
              {book.available_copies}/{book.total_copies}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ height: 60, p: 1.5, pt: 0, gap: 1, alignItems: 'center' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onViewDetails(book)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Chi tiết
        </Button>

        {showBorrowButton && (
          <Button
            size="small"
            variant="contained"
            disabled={!isAvailable || isLoading}
            onClick={() => onBorrow(book)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            {isLoading ? 'Đang xử lý...' : 'Mượn sách'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default BookCard;
