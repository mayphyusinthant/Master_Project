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

import floorA from '../assets/Floors/FLOOR_A.svg';
import floorB from '../assets/Floors/FLOOR_B.svg';
import floorC from '../assets/Floors/FLOOR_C.svg';
import floorD from '../assets/Floors/FLOOR_D.svg';
import floorE from '../assets/Floors/FLOOR_E.svg';
import floorF from '../assets/Floors/FLOOR_F.svg';
import floorG from '../assets/Floors/FLOOR_G.svg';
import floorH from '../assets/Floors/FLOOR_H.svg';

// Map floor letters to image files
const floorMaps = {
  A: { map: floorA, scale: 1 },
  B: { map: floorB, scale: 1 },
  C: { map: floorC, scale: 1 },
  D: { map: floorD, scale: 1.6 },
  E: { map: floorE, scale: 1.6 },
  F: { map: floorF, scale: 1.6 },
  G: { map: floorG, scale: 1 },
  H: { map: floorH, scale: 1.1 },
};

export const PlanInfo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [selectedFloor, setSelectedFloor] = useState('A');
  const [selectedMap, setSelectedMap] = useState(floorMaps['A']);
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
    
  };

  return (
    <Grid2 container spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
      {/* Left Side - Room Information */}
      <Grid2
        
        
        justifyContent="center"
        
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
              
              const floorLetter = newValue.floor.replace(/floor\s*/i, '').toUpperCase();
              
              setSelectedFloor(floorLetter);
              setSelectedMap(floorMaps[floorLetter]);
             
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
        
      <Grid2 >
        <Card sx={{ p: 1, width: 400 }}>
          <CardContent>
            {selectedRoom ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {typeof selectedRoom == 'string' ? selectedRoom : selectedRoom?.roomName}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {typeof selectedRoom == 'string' ? description : selectedRoom?.description}
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
            
      <Grid2 sx={{ width: '100%' }}>
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
              mb: 0,
              width: '100%'
            }}
          >
            {Object.keys(floorMaps).map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? 'contained' : 'outlined'}
                onClick={() => {
                  
                  setSelectedFloor(floor);
                  setSelectedMap(floorMaps[floor]); 
                  
                }}
              >
                {floor}
              </Button>
            ))}
          </Box>
          
          {/* Map Component - Full width */}
          <Box sx={{ width: '100%' }}>
            <Map 
              map={selectedMap.map}
              scale={selectedMap.scale}
              roomData={fullRoomData}
              selectedRoom={selectedRoom} 
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