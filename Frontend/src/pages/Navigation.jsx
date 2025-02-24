import { Box, Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoute, setSelectedRoute } from '../features/history/historySlice';
import { locations } from '../data/locations';

import 'leaflet/dist/leaflet.css'; // Import Leaflet styles
import Map from '../components/Map';
import map from '../assets/Floors/FLOOR B.svg';
// Use your floor plan SVG

export const Navigation = () => {
  const dispatch = useDispatch();
  const selectedRoute = useSelector((state) => state.history.selectedRoute);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [zoom, setZoom] = useState(3);

  const handleNavigate = () => {
    if (from && to) {
      setZoom(4);
      dispatch(addRoute({ from, to }));
    }
  };

  useEffect(() => {
    if (selectedRoute) {
      setFrom(selectedRoute.from || '');
      setTo(selectedRoute.to || '');
      dispatch(setSelectedRoute(null));
    }
  }, [selectedRoute, dispatch]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
      {/* Navigation Inputs */}
      <Box mt={3} display="flex" justifyContent="center" gap={2} width="100%">
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomId}
          value={locations.find((room) => room.roomId === from) || null}
          onChange={(event, newValue) => setFrom(newValue?.roomId || '')}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomId}
          value={locations.find((room) => room.roomId === to) || null}
          onChange={(event, newValue) => setTo(newValue?.roomId || '')}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Button variant="contained" onClick={handleNavigate}>
          Navigate
        </Button>
      </Box>

      <Map zoom={zoom} map={map} />
    </Box>
  );
};
