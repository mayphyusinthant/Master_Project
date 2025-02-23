import { Box, Autocomplete, TextField, Button } from '@mui/material';
import image from '../assets/banner.png'; // Replace with your actual image path
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addRoute } from '../features/history/historySlice';

const locations = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5'];

export const Navigation = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const dispatch = useDispatch();

  const handleNavigate = () => {
    if (from && to) {
      dispatch(addRoute({ from, to }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
      <Box mt={3} display="flex" justifyContent="center" gap={2} width="100%">
        <Autocomplete
          options={locations || []}
          onChange={(event, newValue) => setFrom(newValue)}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={locations || []}
          onChange={(event, newValue) => setTo(newValue)}
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
