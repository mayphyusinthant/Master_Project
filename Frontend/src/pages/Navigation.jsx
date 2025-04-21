import { Box, Autocomplete, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoute, setSelectedRoute } from '../features/history/historySlice';
import { CircularProgress } from '@mui/material';

// import { locations } from '../data/locations';

import 'leaflet/dist/leaflet.css'; // Import Leaflet styles
import Map from '../components/Map';
import map from '../assets/Floors/FLOOR_B.svg';
// Use your floor plan SVG

export const Navigation = () => {
  const dispatch = useDispatch();
  const selectedRoute = useSelector((state) => state.history.selectedRoute);
  const [locations, setLocations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [zoom, setZoom] = useState(3);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all Rooms
  useEffect(()=> {
    fetch("http://localhost:5000/api/rooms")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  }, []);


  const handleNavigate = () => {
    if (from && to) {
      setZoom(4);
      dispatch(addRoute({ from, to }));
      setLoading(true);
      setMessage(''); // Clear previous message
  
      fetch("http://localhost:5000/api/navigate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to }),
      })
        .then((res) => res.json())
        .then((data) => {
          setMessage(data.message);
        })
        .catch((err) => {
          console.error("Error sending navigation data:", err);
          setMessage("Something went wrong. Please try again.");
        })
        .finally(() => setLoading(false));
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
        getOptionLabel={(option) => option.roomName}
      
        value={locations.find((room) => room.roomName === from) || null}
        onChange={(event, newValue) => setFrom(newValue?.roomName || '')}
        renderOption={(props, option) => (
          <li {...props} key={option.id} style={{ display: "flex", justifyContent: "space-between", width: "75%" }}>
            <span>{option.roomName}</span>
            -
            <span>{option.floor}</span>
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
        sx={{ width: 250 }}
      />
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomName}
          
          value={locations.find((room) => room.roomName === to) || null}
          onChange={(event, newValue) => setTo(newValue?.roomName || '')}
          renderOption={(props, option) => (
            <li {...props} key={option.id} style={{ display: "flex", justifyContent: "space-between", width: "75%" }}>
              <span>{option.roomName}</span>
              -
              <span>{option.floor}</span>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Button variant="contained" onClick={handleNavigate} disabled={!from || !to}>
          Navigate
        </Button>
      </Box>

      <Map zoom={zoom} map={map} />
      {loading ? (
        <Box mt={2}>
          <CircularProgress />
        </Box>
      ) : (
        message && (
          <Box mt={2} p={2} border="1px solid #ccc" borderRadius="8px" bgcolor="#f9f9f9">
            {message}
          </Box>
        )
      )}
    </Box>
  );
};
