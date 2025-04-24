import { useState , useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from "react-router-dom";
import dayjs from 'dayjs';

import {
  Box,
  Autocomplete,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CardContent,
} from '@mui/material';

import { Delete } from '@mui/icons-material';

export const RoomBooking = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    roomId,
    roomName,
    roomType,
    startDateTime,
    endDateTime,
    duration,
  } = location.state || {};

  const [bookingTitle, setBookingTitle] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(roomName || '');
  const [selectedType, setSelectedType] = useState(roomType || '');
  const [startbookingDate, setStartBookingDate] = useState(startDateTime || '');
  const [endbookingDate, setEndBookingDate] = useState(endDateTime || '');
  const [durationSet, setDuration] = useState(duration || '');
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [fullRoomData, setFullRoomData] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matriculationNumber, setMatriculationNumber] = useState('');

  const fetchAllBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/current_bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setUserBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setUserBookings([]);
    }
  };


  const removeBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/remove_booking/${bookingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        
        fetchAllBookings();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove booking.');
      }
    } catch (error) {
      console.error('Error removing booking:', error);
      alert('An error occurred while removing the booking.');
    }
  };

  useEffect(() => {
    fetchAllBookings();
    
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        setFullRoomData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching all rooms:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/library_room_types')
      .then((res) => res.json())
      .then((data) => {
        setRoomTypes(data.map(item => item.type));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching room types:', err);
        setIsLoading(false);
      });
  }, []);

  

  const handleDurationChange = (event) => {
    const selectedDuration = event.target.value;
    setDuration(selectedDuration);

    if (startbookingDate) {
      const start = new Date(startbookingDate);
      const [hours, minutes] = selectedDuration.split(':').map(Number);
      const end = new Date(start);
      end.setHours(start.getHours() + hours);
      end.setMinutes(start.getMinutes() + minutes);
      setEndBookingDate(dayjs(end).format('YYYY-MM-DD HH:mm:ss'));
    }
  };

  const handleBooking = async () => {
    if (selectedRoom && bookingTitle && startbookingDate && endbookingDate) {
      const roomData = typeof selectedRoom === 'string'
        ? fullRoomData.find(room => room.roomName === selectedRoom)
        : selectedRoom;

      const newBooking = {
        roomId: roomData?.roomId || roomId,
        roomName: roomData?.roomName || selectedRoom,
        roomType: selectedType,
        title: bookingTitle,
        start_date_time: startbookingDate,
        end_date_time: endbookingDate,
        matriculationNumber: matriculationNumber.trim(),
      };

      try {
        const response = await fetch('http://localhost:5000/api/book_room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBooking),
        });

        if (response.ok) {
          setBookingTitle('');
          setStartBookingDate('');
          setEndBookingDate('');
          setMatriculationNumber('');
          fetchAllBookings();
        }
      } catch (err) {
        console.error('Booking error:', err);
        alert('An error occurred while booking.');
      }
    }
  };


  const filteredRooms = selectedType
  ? fullRoomData.filter(room => room.type === selectedType)
  : fullRoomData;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} width="100%" mt={3}>
      <Typography variant="h4">Room Booking</Typography>

      <Autocomplete
        options={roomTypes}
        value={selectedType}
        onChange={(e, newValue) => {
          setSelectedType(newValue);
          setSelectedRoom('');
        }}
        renderInput={(params) => (
          <TextField {...params} label="Select Room Type" variant="outlined" helperText={isLoading ? 'Loading room types...' : ''} />
        )}
        sx={{ width: 350 }}
        loading={isLoading}
      />

      <Autocomplete
        options={filteredRooms || []}
        getOptionLabel={(option) => typeof option === 'string' ? option : `${option.roomName} (${option.floor})`}
        value={selectedRoom}
        onChange={(e, newValue) => setSelectedRoom(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Room" variant="outlined" helperText={isLoading ? 'Loading available rooms...' : ''} />
        )}
        sx={{ width: 350 }}
        loading={isLoading}
      />

      <TextField label="Booking Title" variant="outlined" value={bookingTitle} onChange={(e) => setBookingTitle(e.target.value)} sx={{ width: 350 }} />

      <TextField
        label="Start Date & Time"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        value={startbookingDate}
        onChange={(e) => setStartBookingDate(dayjs(e.target.value).format('YYYY-MM-DD HH:mm:ss'))}
        sx={{ width: 350 }}
        inputProps={{ min: new Date().toISOString().slice(0, 16) }}
      />

      <FormControl sx={{ minWidth: 350 }}>
        <InputLabel id="duration-label">Duration</InputLabel>
        <Select labelId="duration-label" value={durationSet} onChange={handleDurationChange} label="Duration">
          <MenuItem value="01:00">1 Hour</MenuItem>
          <MenuItem value="01:30">1 Hour 30 Minutes</MenuItem>
          <MenuItem value="02:00">2 Hours</MenuItem>
          <MenuItem value="02:30">2 Hours 30 Minutes</MenuItem>
          <MenuItem value="03:00">3 Hours</MenuItem>
        </Select>
      </FormControl>

      <TextField
  label="Matriculation Number"
  variant="outlined"
  value={matriculationNumber}
  onChange={(e) => setMatriculationNumber(e.target.value)}
  sx={{ width: 350 }}
/>

      <Button variant="contained" onClick={handleBooking} disabled={!selectedRoom || !bookingTitle || !startbookingDate}>
        Book Room
      </Button>

      <Box mt={3} width="60%" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5">Current Bookings</Typography>
        {userBookings.length > 0 ? (
          <List>
            {userBookings.map((booking) => (
              <ListItem key={booking.booking_id}>
                <Card sx={{ width: '100%', p: 2 }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6">Room - {booking.room_name}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booking Duration: {dayjs(booking.start_date_time).format('YYYY-MM-DD HH:mm')} - {dayjs(booking.end_date_time).format('HH:mm')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room - {booking.room_name} - {booking.floor || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => removeBooking(booking.booking_id)}>
                        <Delete />
                      </IconButton>
                    </Box>
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