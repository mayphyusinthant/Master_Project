import { BrowserRouter as Router } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './App.css';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Header />
        <Container maxWidth="md">
          <Box flexGrow={1}>
            <AppRoutes />
          </Box>
        </Container>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
