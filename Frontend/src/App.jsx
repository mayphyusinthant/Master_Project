import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { Navigation } from './pages/Navigation';
import { PlanInfo } from './pages/PlanInfo';
import { NavHistory } from './pages/NavHistory';
import { LibraryInfo } from './pages/LibraryInfo';
import { CampusInfo } from './pages/CampusInfo';
import { About } from './pages/About';

import './App.css';
import { MainPage } from './pages/MainPage';

function App() {
  return (
    <Router>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Header />
        <Container maxWidth="md">
          <Box flexGrow={1}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/navigation" element={<Navigation />} />
              <Route path="/plan-info" element={<PlanInfo />} />
              <Route path="/nav-history" element={<NavHistory />} />
              <Route path="/library-info" element={<LibraryInfo />} />
              <Route path="/campus-info" element={<CampusInfo />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
        </Container>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
