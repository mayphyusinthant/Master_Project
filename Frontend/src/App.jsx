import { BrowserRouter as Router } from 'react-router-dom';
import { Box, Container, useTheme } from '@mui/material';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './App.css';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const theme = useTheme();
  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh" sx={{
        // backgroundColor: theme.palette.background.default,
        backgroundImage: theme.palette.backgroundGradient,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
        color: theme.palette.text.primary,
      }}>
        <Header />
        <Container  maxWidth="lg" sx={{ flexGrow: 1}}>
          <Box >
            <AppRoutes />
          </Box>
        </Container>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
