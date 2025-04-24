import { Box, Typography, useTheme } from '@mui/material';
import image from '../assets/banner.png';

export const MainPageImage = () => {
  const theme = useTheme();
  const bannerImage = theme.palette.banner?.src; 
  const bannerBackground = theme.palette.banner?.background;

  return (
    <Box mt={3} mb={2} position="relative" textAlign="right" sx={{ overflow: 'hidden', borderRadius: '14px' }}>
      {/* Image */}
      <Box component="img" src={bannerImage} alt="Banner" width="100%" sx={{ display: 'block' }} />

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '0%',
          width: '100%',
          height: '100%',
          background: bannerBackground, 
          borderRadius: 'inherit',
           // Adjust the opacity as needed
        }}
      />

      {/* Title */}
      <Typography
        position="absolute"
        top="50%"
        right={40}
        sx={{
          transform: 'translateY(-50%)',
          fontSize: { xs: '1.75rem', sm: '3rem', md: '3.25rem' },
          fontWeight: 'bold',
          // color: 'black',
          padding: '10px 20px',
          whiteSpace: 'normal',
          maxWidth: { xs: '60%', sm: '50%', md: '40%' }, 
        }}
      >
        Makes your navigation easier
      </Typography>
    </Box>
  );
};
