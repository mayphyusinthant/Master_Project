import { Delete, Replay } from '@mui/icons-material';
import { Box, Button, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { clearHistory, removeRoute, setSelectedRoute } from '../features/history/historySlice';
import { PageTitle } from '../components/pageTitle';
import { useNavigate } from 'react-router-dom';

export const NavHistory = () => {
  const history = useSelector((state) => state.history.history);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRepeatRoute = (route) => {
    dispatch(setSelectedRoute(route)); // Store the selected route
    navigate('/navigation'); // Redirect to Navigation page
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{ '& > *': { mb: 1 } }}
    >
      <PageTitle title="Navigation History" />
      <List>
        {history
          .slice()
          .reverse()
          .map((route) => (
            <ListItem key={route.timestamp} sx={{ mb: 1 }}>
              <ListItemText
                primary={`${route.from} → ${route.to}`}
                secondary={`Saved on: ${route.timestamp}`}
              />
              <IconButton onClick={() => handleRepeatRoute(route)}>
                <Replay />
              </IconButton>
              <IconButton
                onClick={() => {
                  dispatch(removeRoute(route.timestamp));
                  console.log('Removed route:', route);
                }}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
      </List>
      {history.length > 0 && (
        <Button
          sx={{ mb: 3 }}
          variant="contained"
          color="secondary"
          onClick={() => dispatch(clearHistory())}
        >
          Clear History
        </Button>
      )}
    </Box>
  );
};
