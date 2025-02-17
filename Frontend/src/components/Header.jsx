import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const Header = () => (
  <AppBar position="static" sx={{ textAlign: 'left', backgroundColor: '#FF5050' }}>
    <Container maxWidth="md">
      <Toolbar>
        <Link to="/">
          <img
            src="../../public/favicon.png"
            alt="Logo"
            style={{ height: '40px', marginRight: '16px' }}
          />
        </Link>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Navigator
        </Typography>
      </Toolbar>
    </Container>
  </AppBar>
);
