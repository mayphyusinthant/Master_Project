import { Clear } from '@mui/icons-material';
import { Box, Button, Typography, CircularProgress, Pagination } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearHistoryFromDB,
  deleteRouteFromDB,
  fetchHistoryFromDB,
  setSelectedRoute,
} from '../features/history/historySlice';
import { PageTitle } from '../components/pageTitle';
import { NavHistoryCard } from '../components/NavHistoryCard';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const NavHistory = () => {
  const { history, loading } = useSelector((state) => state.history);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;


  const paginatedHistory = [...history]
  .sort((a, b) => b.timestamp - a.timestamp) // Newest first
  .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    dispatch(fetchHistoryFromDB());
  }, [dispatch]);

  const handleRepeatRoute = (route) => {
    const normalized = {
      from: route.from_room,
      to:  route.to_room,
      floorFrom: route.floor_from,
      floorTo: route.floor_to,
    };
    dispatch(setSelectedRoute(normalized));
    navigate('/navigation', { state: { fromHistory: true } });
  };

  const handleDeleteRoute = (id) => {
    dispatch(deleteRouteFromDB(id));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={3}
      width="100%"
      mx="auto"
      px={2}
    >
      <PageTitle title="Navigation History" />

      <Box
        width={{ xs: '100%', sm: '95%', md: '95%', lg: '85%' }}
        display="grid"
        gridTemplateColumns={{ sm: '1fr', md: 'repeat(2, 1fr)'}}
        gap={3}
      >
        {loading ? (
          <Box mt={5} display="flex" justifyContent="center" width="100%">
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Box mt={4}>
            <Typography variant="body1">No history yet.</Typography>
          </Box>
        ) : (
          paginatedHistory
            .map((route) => (
              <NavHistoryCard
                key={route.timestamp}
                route={route}
                onRepeat={() => handleRepeatRoute(route)}
                onDelete={() => handleDeleteRoute(route.id)}
              />
            ))
        )}
      </Box>

      {history.length > 0 && !loading && (
        <Button
          sx={{ mb: 3 }}
          variant="contained"
          color="secondary"
          startIcon={<Clear />}
          onClick={() => dispatch(clearHistoryFromDB())}
        >
          Clear History
        </Button>
      )}
      {history.length > itemsPerPage && (
  <Box mt={2} mb={4} display="flex" justifyContent="center">
    <Pagination
      count={Math.ceil(history.length / itemsPerPage)}
      page={page}
      onChange={(e, value) => setPage(value)}
      color="primary"
    />
  </Box>
)}
    </Box>
  );
};
