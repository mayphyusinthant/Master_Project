import { Autocomplete, Box, TextField, Typography, Card, CardContent, Grid2 } from '@mui/material';
import image from '../assets/banner.png';
import { useState } from 'react';
import { locations } from '../locations';
// Import room data

export const PlanInfo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null); // Store full room object

  // Get unique room types from locations.js
  const roomTypes = [...new Set(locations.map((room) => room.type))];

  // Filter rooms based on selected type
  const filteredRooms = selectedType ? locations.filter((room) => room.type === selectedType) : [];

  return (
    <Grid2 container spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
      {/* Left Side - Room Information */}
      <Grid2 item xs={12} md={5} display="flex" flexDirection="column" gap={2}>
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

      {/* Right Side - Selection Fields */}

      {/* Full Width Image */}
      <Grid2 item xs={12} display="flex" justifyContent="center">
        <img src={image} alt="Map" style={{ maxWidth: '100%', height: 'auto' }} />
      </Grid2>
    </Grid2>
  );
};
