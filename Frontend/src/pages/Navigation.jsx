import React, { useState, useEffect, useCallback } from 'react';
import { Box, Autocomplete, TextField, Button, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDispatch, useSelector } from 'react-redux';
import { saveRouteToDB, setSelectedRoute } from '../features/history/historySlice';
import { useLocation } from 'react-router-dom';
// import { locations } from '../data/locations';
//import 'leaflet/dist/leaflet.css'; // Import Leaflet styles

import Map from '../components/Map';

// Import ALL floor SVGs
import floorA_SvgPath from '../assets/Floors/Floor_A.svg';
import floorB_SvgPath from '../assets/Floors/Floor_B.svg';
import floorC_SvgPath from '../assets/Floors/Floor_C.svg';
import floorD_SvgPath from '../assets/Floors/Floor_D.svg';
import floorE_SvgPath from '../assets/Floors/Floor_E.svg';
import floorF_SvgPath from '../assets/Floors/Floor_F.svg';
import floorG_SvgPath from '../assets/Floors/Floor_G.svg';
import floorH_SvgPath from '../assets/Floors/Floor_H.svg';

// Create a mapping from floor letter/name to imported SVG path
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

const floorOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const getMapPathForFloor = (floorId) => {
    if (!floorId) return floorMapPaths['B']; // Default map if floor is unknown (Floor B) -- probably won't use it
    const directMatch = floorMapPaths[floorId];
    if (directMatch) return directMatch;

    const floorLetter = String(floorId).split(' ').pop()?.toUpperCase(); // Get 'A' from 'Floor A', ensure uppercase
    return floorMapPaths[floorLetter] || floorMapPaths['B']; // Default if no match found -- probably won't use it
};

export const Navigation = () => {
  const dispatch = useDispatch();
  const selectedRoute = useSelector((state) => state.history.selectedRoute);

  // State Variables
  const [locations, setLocations] = useState([]); // All available locations for Autocomplete
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
// <<<<<<< admin-navigation-history-fix
  const [loading, setLoading] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState([]); // SVG coordinates from backend
  const [currentMapPath, setCurrentMapPath] = useState(floorMapPaths['B']); // Default to Floor B SVG path
  const location = useLocation();
// =======
  const [loading, setLoading] = useState(false); // Loading indicator for API calls
  const [pathSegments, setPathSegments] = useState([]); // Array of path segments from backend
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0); // Index of the currently viewed segment

  const currentSegment = pathSegments?.[currentSegmentIndex];
  const currentPathCoordinates = currentSegment?.coords || []; // Coordinates for the current segment map
  const currentMapPath = getMapPathForFloor(currentSegment?.floor); // SVG path for the current segment's floor
  const totalSegments = pathSegments.length;
  const isFirstSegment = currentSegmentIndex === 0;
  const isLastSegment = currentSegmentIndex === totalSegments - 1;

 // Determine transition type for messages
 // Instructions for user display
  const getTransitionInstruction = useCallback(() => {
    if (!currentSegment || isLastSegment) return "";
    const endNodeType = currentSegment.end_node_type;
    const nextSegmentFloor = pathSegments[currentSegmentIndex + 1]?.floor;
    let instruction = `Proceed towards Floor ${nextSegmentFloor || 'Next'}`;
    if (!endNodeType) return instruction;
    if (endNodeType.toLowerCase().startsWith('stairs')) {
        instruction = `Take the stairs to Floor ${nextSegmentFloor || 'Next'}`;
    } else if (endNodeType.toLowerCase().startsWith('elevator')) {
        instruction = `Take the elevator to Floor ${nextSegmentFloor || 'Next'}`;
    }
    return instruction;
  }, [currentSegment, isLastSegment, pathSegments, currentSegmentIndex]);

  // Update the main message based on current segment ---
  useEffect(() => {
    // Don't update message if still loading path segments or if no segments exist
    if (loading || pathSegments.length === 0) {
      return;
    }

    const currentFloor = currentSegment?.floor || 'N/A';
    let newMessage = "";

    if (totalSegments === 1) {
      newMessage = `Follow the path on Floor ${currentFloor} to your destination.`;
    } else if (isFirstSegment) { // First segment of multiple
      const instruction = getTransitionInstruction();
      newMessage = `Follow the path on Floor ${currentFloor}. ${instruction}`;
    } else if (isLastSegment) { // Last segment of multiple
      const previousSegment = pathSegments[currentSegmentIndex - 1];
      const arrivalNodeType = previousSegment?.end_node_type;
      let arrivalMethod = "";
      if (arrivalNodeType?.toLowerCase().startsWith('stairs')) {
        arrivalMethod = "After taking the stairs, follow the path";
      } else if (arrivalNodeType?.toLowerCase().startsWith('elevator')) {
        arrivalMethod = "After taking the elevator, follow the path";
      } else {
        arrivalMethod = "Follow the path";
      }
      newMessage = `${arrivalMethod} on Floor ${currentFloor} to your destination.`;
    } else { // Intermediate segment
      const previousSegment = pathSegments[currentSegmentIndex - 1];
      const arrivalNodeType = previousSegment?.end_node_type;
      let arrivalMethod = "";
       if (arrivalNodeType?.toLowerCase().startsWith('stairs')) {
        arrivalMethod = "After taking the stairs, follow the path";
      } else if (arrivalNodeType?.toLowerCase().startsWith('elevator')) {
        arrivalMethod = "After taking the elevator, follow the path";
      } else {
        arrivalMethod = "Follow the path";
      }
      const instruction = getTransitionInstruction();
      newMessage = `${arrivalMethod} on Floor ${currentFloor}. ${instruction}`;
    }

    setMessage(newMessage);
  }, [currentSegmentIndex, pathSegments, loading, currentSegment, getTransitionInstruction, isFirstSegment, isLastSegment, totalSegments]); // Add dependencies
// >>>>>>> main

  // Fetch all Room Locations
  useEffect(()=> {
    setLoading(true);
    setMessage('');
    fetch("http://localhost:5000/api/rooms")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
       })
      .then((data) => {
        if (Array.isArray(data)) {
            const sortedLocations = [...data].sort((a, b) => a.roomName.localeCompare(b.roomName));
            setLocations(sortedLocations);
            console.log(`Loaded ${sortedLocations.length} locations.`);
        } else {
            console.error("Error: Fetched room data is not an array:", data);
            setLocations([]);
            setMessage("Error loading locations (invalid data format).");
        }
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        setMessage("Failed to load locations. Is the backend running?");
        setLocations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Navigation Request
  const handleNavigate = useCallback(() => {
    if (!from || !to) {
        setMessage("Please select both FROM and TO locations.");
        return;
    }
    if (from === to) {
        setMessage("Start and end locations cannot be the same.");
        return;
    }

    console.log(`Navigate from: ${from}, to: ${to}`);

    // Reset path state before fetching new one
    setPathSegments([]);
    setCurrentSegmentIndex(0);
    setMessage('');
    setLoading(true);

    // Find floor info for saving history
    const fromRoom = locations.find((room) => room.roomName === from);
    const toRoom = locations.find((room) => room.roomName === to);
    const floorFrom = fromRoom?.floor || 'Unknown';
    const floorTo = toRoom?.floor || 'Unknown';
    const newRoute = { from, to, floorFrom, floorTo };

    // Dispatch action to save to history
    dispatch(saveRouteToDB(newRoute));

    // Fetch segmented navigation path from backend
    fetch("http://localhost:5000/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ from, to }),
    })
      .then(async (res) => { // Make async to await res.json() in case of error
          if (!res.ok) {
              let errorMsg = `HTTP error! status: ${res.status}`;
              try {
                  const errData = await res.json();
                  errorMsg = errData?.message || errorMsg;
              } catch (parseError) {
                  console.warn("Could not parse error response as JSON.");
              }
              throw new Error(errorMsg);
          }
          // Check content type before parsing
          const contentType = res.headers.get("content-type");
           if (contentType && contentType.indexOf("application/json") !== -1) {
               return res.json();
           } else {
               console.warn("Received successful response but Content-Type is not JSON or body is empty.");
               throw new Error("Received non-JSON response from server.");
           }
      })
      .then((data) => {
        if (data && data.status === 'success' && Array.isArray(data.path_segments)) {
            if (data.path_segments.length > 0) {
                console.log("[Navigation.jsx] Received path segments:", data.path_segments);
                setPathSegments(data.path_segments);
                setCurrentSegmentIndex(0); // Start at the first segment
                setMessage(data.message || `Path found. Displaying segment 1 of ${data.path_segments.length}.`);
            } else {
                 setMessage(data.message || "Navigation successful (no path needed).");
                 setPathSegments([]);
            }
        } else if (data && data.status === 'error') {
            // Handle specific error messages from backend
            setMessage(data.message || "Failed to find a path.");
            setPathSegments([]);
        } else {
             // Handle unexpected success response format
             console.error("Unexpected data format received:", data);
             setMessage("Received unexpected data from the server.");
             setPathSegments([]);
        }
      })
      .catch((err) => {
        console.error("Error during navigation fetch:", err);
        setMessage(err.message || "Something went wrong. Please try again.");
        setPathSegments([]);
      })
      .finally(() => setLoading(false));

  }, [from, to, locations, dispatch]);

  // Handle selecting a route from History
  useEffect(() => {
    if (selectedRoute) {
      console.log("Applying route from history:", selectedRoute);

      const startLoc = locations.find(loc => loc.roomName === selectedRoute.from);
      const endLoc = locations.find(loc => loc.roomName === selectedRoute.to);

      // Set the 'from' and 'to' state for the Autocomplete fields
      setFrom(startLoc ? startLoc.roomName : '');
      setTo(endLoc ? endLoc.roomName : '');

// <<<<<<< admin-navigation-history-fix
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
      
    }
  }, [selectedRoute, dispatch, locations]);

  useEffect(() => {
    if (!location.state?.fromHistory) {
      // Not coming from history page, reset selectedRoute
      dispatch(setSelectedRoute(null));
    }
  }, [location, dispatch]);

  // Component Return JSX
// =======
      // Clear any existing path/message from previous navigation
      setPathSegments([]);
      setCurrentSegmentIndex(0);
      setMessage('Route loaded from history. Click "Navigate" to generate path.');

      dispatch(setSelectedRoute(null));
    }
  }, [selectedRoute, dispatch, locations]);

  // Button Handlers for Segment Navigation
  const handlePreviousSegment = () => {
      if (!isFirstSegment) {
          setCurrentSegmentIndex(prevIndex => prevIndex - 1);
          setMessage(`Displaying segment ${currentSegmentIndex} of ${totalSegments}.`);
      }
  };

  const handleNextSegment = () => {
      if (!isLastSegment) {
          setCurrentSegmentIndex(prevIndex => prevIndex + 1);
           setMessage(`Displaying segment ${currentSegmentIndex + 2} of ${totalSegments}.`); // +2 because index is 0-based and we want the *next* segment number
      }
  };

// >>>>>>> main
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%" p={1}>

      {/* --- Navigation Input Row --- */}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ xs: 1, sm: 2 }}
        width="95%"
        maxWidth="800px"
        flexWrap="wrap"
      >
        <Autocomplete
          options={locations} // Use the fetched and sorted locations
          getOptionLabel={(option) => option.roomName || ''}
          // Check if option object exists before accessing roomName
          isOptionEqualToValue={(option, value) => option?.roomName === value?.roomName}
          // Find the location object matching the current 'from' string
          value={locations.find((loc) => loc.roomName === from) || null}
          onChange={(event, newValue) => setFrom(newValue?.roomName || '')}
          renderOption={(props, option) => (
            // Use roomId for key if available and unique, otherwise roomName
            <li {...props} key={option.roomId || option.roomName}>
              {option.roomName} <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>({option.floor || 'N/A'})</Typography>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: { xs: '80%', sm: 300 } }}
//           sx={{ width: { xs: 'calc(50% - 12px)', sm: 250 }, minWidth: 180 }}
          size="small"
        />
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.roomName || ''}
          isOptionEqualToValue={(option, value) => option?.roomName === value?.roomName}
          value={locations.find((loc) => loc.roomName === to) || null}
          onChange={(event, newValue) => setTo(newValue?.roomName || '')}
           renderOption={(props, option) => (
            <li {...props} key={option.roomId || option.roomName}>
              {option.roomName} <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>({option.floor || 'N/A'})</Typography>
            </li>
          )}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: { xs: '80%', sm: 300 } }}
//        sx={{ width: { xs: 'calc(50% - 12px)', sm: 250 }, minWidth: 180 }}
          size="small"
        />
        <Button
            variant="contained"
            onClick={handleNavigate}
            disabled={!from || !to || loading}
            size="medium"
            sx={{ height: '40px', mt: { xs: 1, sm: 0 } }}
        >
          {loading ? <CircularProgress size={24} color="inherit"/> : "Navigate"}
        </Button>
      </Box>

      {/* Display loading indicator OR message */}
      <Box mt={1} minHeight="40px" display="flex" justifyContent="center" alignItems="center" width="90%" maxWidth="800px">
          {loading ? (
              <CircularProgress size={30} />
          ) : (
              message && (
                  <Typography
                      variant="body1"
                      color={message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") ? "error" : "textPrimary"}
                      textAlign="center"
                      sx={{
                          p: 1,
                          border: '1px solid',
                          borderColor: message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") ? 'error.main' : 'grey.300',
                          borderRadius: '4px',
                          bgcolor: message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") ? 'error.light' : 'grey.100',
                          width: '100%'
                      }}
                  >
                      {message}
                  </Typography>
              )
          )}
      </Box>

      {/* --- Map Display Area --- */}
      {/* Conditionally render Map only if there are segments */}
      {pathSegments.length > 0 && currentSegment && (
          <Map
              key={`${currentSegment.floor}-${currentSegmentIndex}`} // Force re-render on floor/segment change
              map={currentMapPath} // Pass the dynamically determined SVG path
              pathCoordinates={currentPathCoordinates} // Pass coordinates for the CURRENT segment
          />
      )}
       {/* Placeholder when no map is active */}
       {pathSegments.length === 0 && !loading && (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                border="1px dashed #ccc"
                borderRadius="8px"
                width="90%"
                maxWidth="900px"
                minHeight="400px"
                mt={2} mb={2}
                bgcolor="#f9f9f9"
            >
                <Typography color="textSecondary">
                    {locations.length > 0 ? "Select start and end points and click Navigate." : "Loading locations..."}
                </Typography>
            </Box>
       )}

      {/* Segment Navigation Controls */}
      {/* Only show controls if there are multiple segments */}
      {totalSegments > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={1} mb={2} width="90%" maxWidth="600px">
          <Tooltip title="Previous Floor/Segment">
            <span>
              <IconButton
                onClick={handlePreviousSegment}
                disabled={isFirstSegment || loading}
                color="primary"
              >
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="body1" textAlign="center" sx={{ minWidth: '150px' }}>
            Floor: <strong>{currentSegment?.floor || 'N/A'}</strong> (Segment {currentSegmentIndex + 1}/{totalSegments})
          </Typography>

          <Tooltip title="Next Floor/Segment">
             <span>
                <IconButton
                    onClick={handleNextSegment}
                    disabled={isLastSegment || loading}
                    color="primary"
                >
                    <ArrowForwardIcon />
                </IconButton>
             </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
