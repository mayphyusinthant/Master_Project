import {
  Autocomplete,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid2,
  Button,
  Box,
} from '@mui/material';
import Map from '../components/InteractiveMap';
import { useState, useEffect } from 'react';

import floorA from '../assets/Floors/FLOOR A.svg';
import floorB from '../assets/Floors/FLOOR B.svg';
import floorC from '../assets/Floors/FLOOR C.svg';
import floorD from '../assets/Floors/FLOOR D.svg';
import floorE from '../assets/Floors/FLOOR E.svg';
import floorF from '../assets/Floors/FLOOR F.svg';
import floorG from '../assets/Floors/FLOOR G.svg';
import floorH from '../assets/Floors/FLOOR H.svg';

// Map floor letters to image files
const floorMaps = {
  A: floorA,
  B: floorB,
  C: floorC,
  D: floorD,
  E: floorE,
  F: floorF,
  G: floorG,
  H: floorH,
};

export const PlanInfo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [selectedFloor, setSelectedFloor] = useState('A');
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fullRoomData, setFullRoomData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floorRooms, setFloorRooms] = useState([]); 
  const [ description, setDescription ] = useState('');
  // Fetch room types on component mount
  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/all_room_types')
      .then((response) => response.json())
      .then((data) => {
        // Extract just the type values from the array of objects
        const typeValues = data.map(item => item.type);
        setRoomTypes(typeValues);
        console.log("Room Types:", typeValues);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching rooms:', error);
        setIsLoading(false);
      });
  }, []);

  // Fetch rooms when room type changes
  useEffect(() => {
    const params = new URLSearchParams({
      roomType: selectedType,
    });
    
    if (selectedType) {
      setIsLoading(true);
      
      const url = `http://localhost:5000/api/available_rooms?${params}`;
      
      console.log("Fetching from URL:", url);
      
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Extract room values from the response
          const roomValues = data.map(item => item.roomName);
          setRooms(roomValues);
          
          // Store the full room objects for later use
          setFullRoomData(data);
          
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching rooms:', error);
          setIsLoading(false);
        });
    } else {
      console.log("No room type selected yet");
    }
  }, [selectedType]);

  // Fetch all rooms for map functionality
  useEffect(() => {
    fetch('http://localhost:5000/api/available_rooms')
      .then((response) => response.json())
      .then((data) => {
        console.log("All rooms data:", data);
        // Filter rooms based on the selected floor when floor changes
        setFullRoomData(data);

        updateFloorRooms(data, selectedFloor);
      })
      .catch((error) => {
        console.error('Error fetching all rooms:', error);
      });
  }, []);

  // Update floor rooms when selected floor changes
  useEffect(() => {
    if (fullRoomData.length > 0) {
      updateFloorRooms(fullRoomData, selectedFloor);
    }
  }, [selectedFloor, fullRoomData]);

  // Filter rooms for the current floor
  const updateFloorRooms = (allRooms, floor) => {
    const roomsOnFloor = allRooms.filter(room => 
      room.floor === floor || 
      (room.floor && room.floor.toUpperCase() === floor)
    );
    setFloorRooms(roomsOnFloor);
    console.log(`Rooms on floor ${floor}:`, roomsOnFloor);
  };

  return (
    <Grid2 container spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
      {/* Left Side - Room Information */}
      <Grid2
        item
        xs={12}
        justifyContent="center"
        md={5}
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ minHeight: 160 }}
      >
        <Autocomplete
          options={roomTypes}
          value={selectedType}
          onChange={(event, newValue) => {
            setSelectedType(newValue);
            setSelectedRoom(null); // Reset room selection when type changes
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select Room Type" variant="outlined" />
          )}
        />

        {/* Room Selection */}
        <Autocomplete
          options={fullRoomData || []}
          getOptionLabel={(option) =>
            typeof option === 'string'
              ? option
              : `${option.roomName} (${option.floor})`
          }
          value={selectedRoom}
          onChange={(event, newValue) => {
            setSelectedRoom(newValue);
            // If a room is selected, also set the floor to match that room
            if (newValue && newValue.floor) {
              setSelectedFloor(newValue.floor.toUpperCase());
            }
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Select Room" 
              variant="outlined"
              helperText={isLoading ? "Loading available rooms..." : ""}
            />
          )}
          sx={{ width: 350 }}
          loading={isLoading}
        />
      </Grid2>
        
      <Grid2 item xs={12} md={8}>
        <Card sx={{ p: 1, width: 400 }}>
          <CardContent>
            {selectedRoom ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedRoom}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {description || "No description available"}
                </Typography>
               
              </>
            ) : (
              <Typography variant="body1">
                Hover over a room on the map or select a room to view details.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid2>
            
      <Grid2 item xs={12} sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Floor Buttons Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'wrap',
              mb: 2,
              width: '100%'
            }}
          >
            {Object.keys(floorMaps).map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'contained' : 'outlined'}
                onClick={() => setSelectedFloor(floor)}
              >
                {floor}
              </Button>
            ))}
          </Box>
          
          {/* Map Component - Full width */}
          <Box sx={{ width: '100%' }}>
            <Map 
              map={floorMaps[selectedFloor]} 
              roomData={fullRoomData} 
              setSelectedRoom={setSelectedRoom}
              setSelectedType={setSelectedType}
              setDescription={setDescription}
            />
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  );
};