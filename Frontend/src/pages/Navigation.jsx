import { Box, Autocomplete, TextField, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveRouteToDB, setSelectedRoute } from '../features/history/historySlice';

// import { locations } from '../data/locations';

//import 'leaflet/dist/leaflet.css'; // Import Leaflet styles

import Map from '../components/Map';

// --- Import ALL floor SVGs ---
import floorA_SvgPath from '../assets/Floors/Floor_A.svg';
import floorB_SvgPath from '../assets/Floors/Floor_B.svg';
import floorC_SvgPath from '../assets/Floors/Floor_C.svg';
import floorD_SvgPath from '../assets/Floors/Floor_D.svg';
import floorE_SvgPath from '../assets/Floors/Floor_E.svg';
import floorF_SvgPath from '../assets/Floors/Floor_F.svg';
import floorG_SvgPath from '../assets/Floors/Floor_G.svg';
import floorH_SvgPath from '../assets/Floors/Floor_H.svg';

// --- Create a mapping from floor letter/name to imported SVG path ---
const floorMapPaths = {
    'A': floorA_SvgPath,
    'B': floorB_SvgPath,
    'C': floorC_SvgPath,
    'D': floorD_SvgPath,
    'E': floorE_SvgPath,
    'F': floorF_SvgPath,
    'G': floorG_SvgPath,
    'H': floorH_SvgPath,
    // Add mappings for 'Floor A', 'Floor B' etc.
    'Floor A': floorA_SvgPath,
    'Floor B': floorB_SvgPath,
    'Floor C': floorC_SvgPath,
    'Floor D': floorD_SvgPath,
    'Floor E': floorE_SvgPath,
    'Floor F': floorF_SvgPath,
    'Floor G': floorG_SvgPath,
    'Floor H': floorH_SvgPath,
};

export const Navigation = () => {
  const dispatch = useDispatch();
  const selectedRoute = useSelector((state) => state.history.selectedRoute);
  const [locations, setLocations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState([]); // SVG coordinates from backend
  const [currentMapPath, setCurrentMapPath] = useState(floorMapPaths['B']); // Default to Floor B SVG path

  // Fetch all Rooms
  useEffect(()=> {
    setLoading(true);
    fetch("http://localhost:5000/api/rooms")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
       })
      .then((data) => {
        if (Array.isArray(data)) {
            setLocations(data);
        } else {
            console.error("Error: Fetched room data is not an array:", data);
            setLocations([]);
            setMessage("Error loading locations.");
        }
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        setMessage("Failed to load locations. Is the backend running?");
        setLocations([]);
      })
      .finally(() => setLoading(false));
  }, []);


  const handleNavigate = () => {
    if (from && to) {

    //const startLocation = locations.find(loc => loc.roomName === from);
    const fromRoom = locations.find((room) => room.roomName === from);
    const toRoom = locations.find((room) => room.roomName === to);

    const floorFrom = fromRoom?.floor || '';
    const floorTo = toRoom?.floor || '';

    const newRoute = { from, to, floorFrom, floorTo };

    if (fromRoom && fromRoom.floor) {
          // Extract floor key
          const floorKey = fromRoom.floor;
          const newMapPath = floorMapPaths[floorKey];
          if (newMapPath) {
              console.log(`Switching map to Floor ${floorKey}`);
              setCurrentMapPath(newMapPath); // Update the map SVG path state
          } else {
              console.warn(`Map SVG path not found for floor key: ${floorKey}`);
              setMessage(`Cannot display map for floor ${floorKey}.`);
              // Optionally default or return
              // setCurrentMapPath(floorMapPaths['B']); // Default to B?
              // return;
          }
      } else {
          console.warn("Could not determine floor for the starting location:", from);
          setMessage("Could not determine the floor for the starting location.");
          // return;
      }

      dispatch(saveRouteToDB(newRoute));

      setLoading(true);
      setMessage('');
      setPathCoordinates([]); // Clear previous path coordinates

      // Fetch navigation path (including coordinates) from backend
      fetch("http://localhost:5000/api/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ from, to }),
      })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData?.message || res.statusText || `HTTP error! status: ${res.status}`);
                }).catch(() => {
                     throw new Error(res.statusText || `HTTP error! status: ${res.status}`);
                });
            }
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res.json();
            } else {
                console.warn("Received successful response but Content-Type is not JSON or body is empty.");
                return null;
            }
        })
        .then((data) => {
          if (data) {
              setMessage(data.message || '');
              if (data.status === 'success' && data.path_coords) {
                console.log("[Navigation.jsx] Received path coordinates:", data.path_coords); // Debug
                setPathCoordinates(data.path_coords); // Store the SVG coordinates
              } else {
                setPathCoordinates([]);
                if (data.status === 'error' && !data.message) {
                    setMessage("Could not find a path.");
                }
              }
          } else {
              setMessage("Received an unexpected or empty response from the server.");
              setPathCoordinates([]);
          }
        })
        .catch((err) => {
          console.error("Error sending/processing navigation data:", err);
          let errorMessage = "Something went wrong. Please try again.";
          if (err instanceof Error && err.message) {
              errorMessage = err.message;
          } else if (typeof err === 'string') {
              errorMessage = err;
          }
          setMessage(errorMessage);
          setPathCoordinates([]);
        })
        .finally(() => setLoading(false));
    }
  }; // End handleNavigate

  useEffect(() => {
    if (selectedRoute) {
      const startLoc = locations.find(loc => loc.roomName === selectedRoute.from);
      const endLoc = locations.find(loc => loc.roomName === selectedRoute.to);

      setFrom(startLoc ? startLoc.roomName : '');
      setTo(endLoc ? endLoc.roomName : '');

      // Update map based on the 'from' location from history
      if (startLoc && startLoc.floor) {
           const floorKey = startLoc.floor;
           const newMapPath = floorMapPaths[floorKey];
           setCurrentMapPath(newMapPath || floorMapPaths['B']); // Default if not found
       } else {
            setCurrentMapPath(floorMapPaths['B']); // Default if start location not found
       }

      setPathCoordinates([]);
      setMessage('');
      dispatch(setSelectedRoute(null));
    }
  }, [selectedRoute, dispatch, locations]);

  // Component Return JSX
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">

      {/* Navigation Inputs */}
      <Box mt={3} display="flex" justifyContent="center" alignItems="center" gap={2} width="90%" flexWrap="wrap">
        <Autocomplete
          options={locations}
          // Ensure options have unique keys if possible (using roomId)
          getOptionKey={(option) => option.roomId || option.roomName}
          getOptionLabel={(option) => option.roomName || ''}
          isOptionEqualToValue={(option, value) => option.roomName === value?.roomName}
          value={locations.find((room) => room.roomName === from) || null}
          onChange={(event, newValue) => setFrom(newValue?.roomName || '')}
          renderOption={(props, option) => (
            // Use roomId for key if available and unique, otherwise roomName
            <li {...props} key={option.roomId || option.roomName} style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>{option.roomName}</span>
              <span style={{ color: 'gray', marginLeft: '10px' }}>({option.floor})</span>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: { xs: '80%', sm: 250 } }}
          size="small"
        />
        <Autocomplete
          options={locations}
          getOptionKey={(option) => option.roomId || option.roomName}
          getOptionLabel={(option) => option.roomName || ''}
          isOptionEqualToValue={(option, value) => option.roomName === value?.roomName}
          value={locations.find((room) => room.roomName === to) || null}
          onChange={(event, newValue) => setTo(newValue?.roomName || '')}
          renderOption={(props, option) => (
             // Use roomId for key if available and unique, otherwise roomName
            <li {...props} key={option.roomId || option.roomName} style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>{option.roomName}</span>
              <span style={{ color: 'gray', marginLeft: '10px' }}>({option.floor})</span>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: { xs: '80%', sm: 250 } }}
          size="small"
        />
        <Button
            variant="contained"
            onClick={handleNavigate}
            disabled={!from || !to || loading}
            size="large"
        >
          {loading ? <CircularProgress size={24} color="inherit"/> : "Navigate"}
        </Button>
      </Box>

      {/* Loading / Message Box */}
      {loading ? (
        <Box mt={2}>
          <CircularProgress />
        </Box>
      ) : (
        message && (
          <Box mt={1} p={1} border="1px solid #ccc" borderRadius="4px" bgcolor="#f0f0f0" width="90%" maxWidth="600px" textAlign="center">
            {message}
          </Box>
        )
      )}

      {/* Map Component - Pass the DYNAMIC currentMapPath state */}
      <Map
        map={currentMapPath}
        pathCoordinates={pathCoordinates}
      />

    </Box>
  ); // End return
}; // End component definition

// Ensure no default export if this file exports multiple components
// export default Navigation;