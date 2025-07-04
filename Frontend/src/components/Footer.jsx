import { Facebook, Instagram, Twitter } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme } from '@mui/material';

export const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 'auto',
        py: 2,
        backgroundColor: theme.palette.background.footer,
        position: 'relative',
        bottom: 0,
        width: '100%',
        color: 'white',
      }}
    >
      <Typography variant="body1" mr={2}>
        Follow us:
      </Typography>
      <IconButton color="inherit">
        <Facebook />
      </IconButton>
      <IconButton color="inherit">
        <Instagram />
      </IconButton>
      <IconButton color="inherit">
        <Twitter />
      </IconButton>
    </Box>
  );
}
