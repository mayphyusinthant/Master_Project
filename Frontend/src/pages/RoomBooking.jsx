import { useState , useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from "react-router-dom";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DialogBox from "../components/DialogBox"
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

  const {
    roomId,
    roomName,
    roomType,
    startDateTime,
    endDateTime,
    duration,
  } = location.state || {};

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [bookingTitle, setBookingTitle] = useState('');
  const [matriculationNumber, setMatriculationNumber] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(roomName || '');
  const [selectedType, setSelectedType] = useState(roomType || '');
  const [startbookingDate, setStartBookingDate] = useState(startDateTime || '');
  const [endbookingDate, setEndBookingDate] = useState(endDateTime || '');
  const [durationSet, setDuration] = useState(duration || '');
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [fullRoomData, setFullRoomData] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [lastFetched, setLastFetched] = useState('');

  const [isLoading, setIsLoading] = useState(false);


  const removeBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/remove_booking/${bookingId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setIsDialogOpen(true);
        setDialogMessage("Booking removed successfully!");

        fetchUserBookings();
      } else {
        const errorData = await response.json();
        setIsDialogOpen(true);
        setDialogMessage("Failed to remove booking.");
      }
    } catch (error) {
      console.error('Error removing booking:', error);
      setIsDialogOpen(true);
      setDialogMessage("An error occurred while removing the booking.");
      
    }
  };


  const fetchUserBookings = async () => {
    if (!matriculationNumber) {
      setUserBookings([]);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/current_bookings?student_id=${matriculationNumber}`);
      if (!res.ok) throw new Error('Failed to fetch user bookings');
      const data = await res.json();
      setUserBookings(data);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    }
  };


  const fetchAvailableRooms = async () => {
    if (startbookingDate && endbookingDate) {
      setIsLoading(true);
      const params = new URLSearchParams({
        start_date_time: startbookingDate,
        end_date_time: endbookingDate,
        roomType: selectedType,
      });
  
      const url = `http://localhost:5000/api/available_library_rooms?${params}`;
      console.log("Fetching from URL:", url);
  
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
  
        const roomValues = data.map(item => item.roomName);
        setRooms(roomValues);
  
        setFullRoomData(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Start or end date not set yet. Skipping fetch.");
    }
  };


  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/library_room_types')
      .then((response) => response.json())
      .then((data) => {
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


  useEffect(() => {
    if (startbookingDate && endbookingDate && selectedType) {
      fetchAvailableRooms();
    }
  }, [startbookingDate, endbookingDate, selectedType]); 


  useEffect(() => {
    console.log("Testing - ", startbookingDate, endbookingDate);
    if (/^\d{8}$/.test(matriculationNumber) && matriculationNumber !== lastFetched) {
      fetchUserBookings();
      setLastFetched(matriculationNumber);
    } else if (matriculationNumber.length < 8) {
      setUserBookings([]);
      setLastFetched(matriculationNumber);
    }
  }, [matriculationNumber]);


  const handleDurationChange = (event) => {
    const selectedDuration = event.target.value;

    setDuration(selectedDuration);
  
    if (startbookingDate) {
      const start = new Date(startbookingDate);
      const [hours, minutes] = selectedDuration.split(':').map(Number);
      const end = new Date(start);
      end.setHours(start.getHours() + hours);
      end.setMinutes(start.getMinutes() + minutes);

      const formattedEndDate = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
      setEndBookingDate(formattedEndDate);
    }
  };



  const handleBooking = async () => {
    if (selectedRoom && bookingTitle && startbookingDate && endbookingDate && matriculationNumber) {
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
        matriculationNumber,
      };
  
      try {
        const response = await fetch('http://localhost:5000/api/book_room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBooking),
        });
      
        let result = {};
        try {
          result = await response.json();
        } catch (jsonError) {
          console.warn('No JSON response body:', jsonError);
        }
      
        if (response.ok) {
          setIsDialogOpen(true);
          setDialogMessage("Booking Successful !");
         

          setBookingTitle('');
          setStartBookingDate('');
          setEndBookingDate('');
          setSelectedRoom('');
          setDuration('');
          setFullRoomData([]);
          fetchUserBookings();        
        } else {
          console.error(result.error || 'Booking failed!');
          setIsDialogOpen(true);
          setDialogMessage("Booking Failed !");
         
        }
      } catch (error) {
        console.error("Booking error:", error);
        setIsDialogOpen(true);
        setDialogMessage("Booking Error Occurs !");
         
      }
    }
  };



    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={3} width="100%" mt={3}>

        <DialogBox 
            open={isDialogOpen} 
            message={dialogMessage} 
            onClose={() => setIsDialogOpen(false)} 
          />
        <Typography variant="h4">Room Booking</Typography>
  
        {/* Room Type Selection */}
        <Autocomplete
          options={roomTypes}
          value={selectedType}
          onChange={(event, newValue) => {
            setSelectedType(newValue);
            setSelectedRoom(''); 
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Select Room Type" 
              variant="outlined"
              helperText={isLoading ? "Loading room types..." : ""}
            />
          )}
          sx={{ width: 350 }}
          loading={isLoading}
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
          onChange={(event, newValue) => setSelectedRoom(newValue)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Select Room" 
              variant="outlined"
              helperText={isLoading ? "Loading available rooms..." : ""}
            />
          )}
          noOptionsText="Select Booking Date & Time to See Available Rooms"
          sx={{ width: 350 }}
          // disabled={!startbookingDate || !endbookingDate}
          loading={isLoading}
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
          label="Start Date & Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          value={startbookingDate}
          onChange={(e) => setStartBookingDate(dayjs(e.target.value).format('YYYY-MM-DD HH:mm:ss'))}
          sx={{ width: 350 }}
          inputProps={{
            min: new Date().toISOString().slice(0, 16), // Restrict past dates
          }}
        />


        <FormControl sx={{ minWidth: 350 }}>
            <InputLabel id="duration-label">Duration</InputLabel>
            <Select
              labelId="duration-label"
              value={durationSet}
              onChange={handleDurationChange}
              label="Duration"
              sx={{
                textAlign: 'left',
                '& .MuiSelect-select': {
                  textAlign: 'left',
                  paddingLeft: '14px' 
                }
              }}
            
            >
              <MenuItem value="01:00">1 Hour</MenuItem>
              <MenuItem value="01:30">1 Hour 30 Minutes</MenuItem>
              <MenuItem value="02:00">2 Hours</MenuItem>
              <MenuItem value="02:30">2 Hours 30 Minutes</MenuItem>
              <MenuItem value="03:00">3 Hours</MenuItem>
            </Select>
        </FormControl>


        {/* Matriculation Number or Staff ID */}
        <TextField
          label="Matriculation Number or Staff ID"
          variant="outlined"
          value={matriculationNumber}
          onChange={(e) => setMatriculationNumber(e.target.value)}
          sx={{ width: 350 }}
        />
  
        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleBooking}
        >
          Book Room
        </Button> 
  
        {/* Booking List */}
        <Box mt={3} width="60%">
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
                          Booking Duration:
                          {dayjs(booking.start_date_time).format("YYYY-MM-DD HH:mm")} - {dayjs(booking.end_date_time).format("HH:mm")}
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