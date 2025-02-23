import { Box, Autocomplete, TextField, Button } from '@mui/material';
import image from '../assets/banner.png'; // Replace with your actual image path
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoute, setSelectedRoute } from '../features/history/historySlice';
import { locations } from '../locations';

export const Navigation = () => {
  const dispatch = useDispatch();
  const selectedRoute = useSelector((state) => state.history.selectedRoute);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleNavigate = () => {
    if (from && to) {
      dispatch(addRoute({ from, to }));
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      setFrom(selectedRoute.from || '');
      setTo(selectedRoute.to || '');
      dispatch(setSelectedRoute(null)); // Clear after applying
    }
  }, [selectedRoute, dispatch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      width="100%"
    >
      <Box mt={3} display="flex" justifyContent="center" gap={2} width="100%">
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomId} // Use roomId as label
          value={locations.find((room) => room.roomId === from) || null} // Set correct object value
          onChange={(event, newValue) => setFrom(newValue?.roomId || '')}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomId} // Use roomId as label
          value={locations.find((room) => room.roomId === to) || null} // Set correct object value
          onChange={(event, newValue) => setTo(newValue?.roomId || '')}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Button variant="contained" onClick={handleNavigate}>
          Navigate
        </Button>
      </Box>

      <Box mt={2} display="flex" justifyContent="center">
        <img src={image} alt="Map" style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    </Box>
  );
};
