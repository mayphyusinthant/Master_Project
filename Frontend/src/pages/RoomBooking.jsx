import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { libraryRooms } from '../data/libraryRooms';
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique booking IDs
import { addBooking, removeBooking } from '../features/roomBooking/roomBookingSlice';

export const RoomBooking = () => {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.roomBooking.bookings);

  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  // Get unique room types
  const roomTypes = [...new Set(libraryRooms.map((room) => room.type))];

  // Filter rooms based on selected type
  const filteredRooms = selectedType
    ? libraryRooms.filter((room) => room.type === selectedType)
    : [];

  // Handle booking submission
  const handleBooking = () => {
    if (selectedRoom && bookingTitle && bookingDate) {
      const newBooking = {
        id: uuidv4(), // Generate unique ID
        roomId: selectedRoom.roomId,
        type: selectedRoom.type,
        title: bookingTitle,
        date: bookingDate,
      };
      dispatch(addBooking(newBooking));
      setBookingTitle('');
      setBookingDate('');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} width="100%" mt={3}>
      <Typography variant="h4">Room Booking</Typography>

      {/* Room Type Selection */}
      <Autocomplete
        options={roomTypes}
        value={selectedType}
        onChange={(event, newValue) => {
          setSelectedType(newValue);
          setSelectedRoom(null);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Select Room Type" variant="outlined" />
        )}
        sx={{ width: 350 }}
      />

      {/* Room Selection */}
      <Autocomplete
        options={filteredRooms}
        getOptionLabel={(option) => option.roomId}
        value={selectedRoom}
        onChange={(event, newValue) => setSelectedRoom(newValue)}
        renderInput={(params) => <TextField {...params} label="Select Room" variant="outlined" />}
        sx={{ width: 350 }}
        disabled={!selectedType}
      />

      {/* Booking Title */}
      <TextField
        label="Booking Title"
        variant="outlined"
        value={bookingTitle}
        onChange={(e) => setBookingTitle(e.target.value)}
        sx={{ width: 350 }}
      />

      {/* Date & Time Selection */}
      <TextField
        label="Select Date & Time"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        value={bookingDate}
        onChange={(e) => setBookingDate(e.target.value)}
        sx={{ width: 350 }}
        inputProps={{
          min: new Date().toISOString().slice(0, 16), // Restrict past dates
          
        }}
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        onClick={handleBooking}
        disabled={!selectedRoom || !bookingTitle || !bookingDate}
      >
        Book Room
      </Button>

      {/* Booking List */}
      <Box mt={3} width="60%">
        <Typography variant="h5">Current Bookings</Typography>
        {bookings.length > 0 ? (
          <List>
            {bookings.map((booking) => (
              <ListItem key={booking.id}>
                <Card sx={{ width: '100%', p: 2 }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ListItemText
                      primary={`${booking.roomId} - ${booking.type}`}
                      secondary={`${booking.title} | ${booking.date}`}
                    />
                    <IconButton onClick={() => dispatch(removeBooking(booking.id))}>
                      <Delete />
                    </IconButton>
                  </CardContent>
                </Card>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No bookings yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
};
