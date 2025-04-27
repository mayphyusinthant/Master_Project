import { Clear } from '@mui/icons-material';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
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
import { useEffect } from 'react';

export const NavHistory = () => {
  const { history, loading } = useSelector((state) => state.history);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        width="100%"
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={2}
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
          history
            .slice()
            
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
    </Box>
  );
};
