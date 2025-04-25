import React, { useEffect, useState, useRef } from 'react';
import Map from '../components/Map';
import { PageTitle } from '../components/pageTitle';
import map from '../assets/Floors/Library.svg';
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Container,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

export const LibraryInfo = () => {
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [startDateTime, setStartDateTime] = useState(dayjs().startOf('day'));
  const [duration, setDuration] = useState('1:00');
  const [endDateTime, setEndDateTime] = useState(dayjs().add(1, 'hour'));
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const defaultType = "All";
  const mapContainerRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms')
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
      })
      .catch((error) => {
        console.error('Error fetching rooms:', error);
      });
  }, []);

  const fetchAvailableRooms = () => {
    if (!startDateTime || !endDateTime) {
      alert('Please provide both start and end date-time.');
      return;
    }

    setLoading(true);
    fetch(
      `http://localhost:5000/api/available_library_rooms?start_date_time=${encodeURIComponent(
        startDateTime.format('YYYY-MM-DD HH:mm:ss')
      )}&end_date_time=${encodeURIComponent(
        endDateTime.format('YYYY-MM-DD HH:mm:ss')
      )}&roomType=${encodeURIComponent(defaultType)}`
    )
      .then((response) => response.json())
      .then((data) => {
        setAvailableRooms(data);
      })
      .catch((error) => {
        console.error('Error fetching available library rooms:', error);
      })
      .finally(() => setLoading(false));
  };

  const handleDurationChange = (event) => {
    const selectedDuration = event.target.value;
    setDuration(selectedDuration);

    // Calculate the end date-time based on the selected duration
    const [hours, minutes] = selectedDuration.split(':').map(Number);
    setEndDateTime(startDateTime.add(hours, 'hour').add(minutes, 'minute'));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg">
      <PageTitle title="Library Information" />
      
      {/* Map container with appropriate aspect ratio and padding */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: '100%',
          height: 'auto', // Fixed height viewport units
          minHeight: '500px', // Minimum height to ensure visibility
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #ddd',
          borderRadius: '4px',
          mb: 4,
          '& svg': {
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Ensures the whole map is visible
          }
        }}
      >
        <Map zoom={1} map={map} />
      </Box>

      {/* Date-Time Controls */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent={{ xs: 'center', md: 'space-between' }}
        gap={2}
        mb={3}
        p={2}
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Start Date-Time"
            value={startDateTime}
            onChange={(newValue) => {
              setStartDateTime(newValue);
              const [hours, minutes] = duration.split(':').map(Number);
              setEndDateTime(newValue.add(hours, 'hour').add(minutes, 'minute'));
            }}
            sx={{ width: { xs: '100%', md: '30%' } }}
          />
        </LocalizationProvider>

        <FormControl sx={{ width: { xs: '100%', md: '40%' } }}>
          <InputLabel id="duration-label">Duration</InputLabel>
          <Select
            labelId="duration-label"
            value={duration}
            onChange={handleDurationChange}
            label="Duration"
          >
            <MenuItem value="01:00">1 Hour</MenuItem>
            <MenuItem value="01:30">1 Hour 30 Minutes</MenuItem>
            <MenuItem value="02:00">2 Hours</MenuItem>
            <MenuItem value="02:30">2 Hours 30 Minutes</MenuItem>
            <MenuItem value="03:00">3 Hours</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          onClick={fetchAvailableRooms}
          sx={{ width: { xs: '100%', md: '25%' } }}
          size="large"
        >
          CHECK AVAILABILITY
        </Button>
      </Box>

      {/* Available Rooms */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : (
        availableRooms.length > 0 && (
          <Box mt={3} width="100%">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Room Name</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableRooms
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((room, index) => (
                      <TableRow key={room.roomId}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{room.roomName}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>{room.description}</TableCell>
                        <TableCell>
                          <Link
                            to="/room-booking"
                            state={{
                              roomId: room.roomId,
                              roomName: room.roomName,
                              roomType: room.type,
                              startDateTime: startDateTime.format('YYYY-MM-DD HH:mm:ss'),
                              endDateTime: endDateTime.format('YYYY-MM-DD HH:mm:ss'),
                              duration: duration,
                            }}
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant="contained" color="primary">
                              Book Room
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={availableRooms.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        )
      )}
    </Container>
  );
};