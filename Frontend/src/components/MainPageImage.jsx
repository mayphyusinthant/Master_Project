import { Box, Typography } from '@mui/material';
import image from '../assets/banner.png';

export const MainPageImage = () => {
  return (
    <Box mt={3} mb={2} position="relative" textAlign="right">
      {/* Image */}
      <Box component="img" src={image} alt="Banner" width="100%" sx={{ display: 'block' }} />

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '0%',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)',
        }}
      />

      {/* Title */}
      <Typography
        position="absolute"
        top="50%"
        right={40}
        sx={{
          transform: 'translateY(-50%)',
          fontSize: '3rem',
          fontWeight: 'bold',
          color: 'black', // Black text
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '10px 20px',
          whiteSpace: 'normal',
          maxWidth: '40%',
        }}
      >
        Makes your navigation easier
      </Typography>
    </Box>
  );
};
