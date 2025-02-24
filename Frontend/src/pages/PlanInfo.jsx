import {
  Autocomplete,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid2,
  Button,
} from '@mui/material';
import map from '../assets/Floors/FLOOR B.svg';
import { useState } from 'react';
import { locations } from '../data/locations';
import Map from '../components/Map';

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
// Import room data

export const PlanInfo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null); // Store full room object
  const [selectedFloor, setSelectedFloor] = useState('A');

  // Get unique room types from locations.js
  const roomTypes = [...new Set(locations.map((room) => room.type))];

  // Filter rooms based on selected type
  const filteredRooms = selectedType ? locations.filter((room) => room.type === selectedType) : [];

  return (
    <Grid2 container spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
      {/* Left Side - Room Information */}
      <Grid2
        item
        xs={12}
        justifyContent="center"
        // alignItems="center"
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

        <Autocomplete
          options={filteredRooms}
          getOptionLabel={(option) => option.roomId} // Show room ID as label
          value={selectedRoom}
          sx={{ width: 250 }}
          onChange={(event, newValue) => setSelectedRoom(newValue)} // Store full room object
          renderInput={(params) => (
            <TextField {...params} label="Select Room Number" variant="outlined" />
          )}
          disabled={!selectedType} // Disable if no type is selected
        />
      </Grid2>
      <Grid2 item xs={12} md={8}>
        <Card sx={{ p: 1, width: 400 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedRoom?.roomId} - {selectedRoom?.type}
            </Typography>
            <Typography variant="body1" sx={{ mt: 0 }}>
              {selectedRoom?.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0 }}>
              <strong>Responsible Person:</strong> {selectedRoom?.responsiblePerson}
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 item xs={12} display="flex" justifyContent="center" gap={1} flexWrap="wrap">
        {Object.keys(floorMaps).map((floor) => (
          <Button
            key={floor}
            variant={selectedFloor === floor ? 'contained' : 'outlined'}
            onClick={() => setSelectedFloor(floor)}
          >
            {floor}
          </Button>
        ))}
      </Grid2>

      {/* Right Side - Selection Fields */}

      {/* Full Width Image */}
      <Map zoom={3} map={floorMaps[selectedFloor]} />
    </Grid2>
  );
};
