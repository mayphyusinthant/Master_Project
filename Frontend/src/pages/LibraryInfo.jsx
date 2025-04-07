import Map from '../components/Map';
import { PageTitle } from '../components/pageTitle';
import map from '../assets/Floors/FLOOR B.svg';
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

export const LibraryInfo = () => {
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [startDateTime, setStartDateTime] = useState(dayjs().startOf('day')); // Default to today at 00:00
  const [endDateTime, setEndDateTime] = useState(dayjs().endOf('day')); // Default to today at 23:59
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

   
  useEffect(() => {
    fetch("http://localhost:5000/api/rooms")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  }, []);

  const fetchAvailableRooms = () => {
    if (!startDateTime || !endDateTime) {
      alert("Please provide both start and end date-time.");
      return;
    }

    setLoading(true);
    fetch(
      `http://localhost:5000/api/available_library_rooms?start_date_time=${encodeURIComponent(
        startDateTime.format('YYYY-MM-DD HH:mm:ss')
      )}&end_date_time=${encodeURIComponent(endDateTime.format('YYYY-MM-DD HH:mm:ss'))}`
    )
      .then((response) => response.json())
      .then((data) => {
        setAvailableRooms(data);
      })
      .catch((error) => {
        console.error("Error fetching available library rooms:", error);
      })
      .finally(() => setLoading(false));
  };

  const handleBookRoom = (roomId) => {
    alert(`Room ${roomId} booked!`);
    // Add your booking logic here
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); 
  };
  
  return (
    <>
      <PageTitle title="Library Information" />
      <Map zoom={3} map={map} />

      <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
        {/* Date-Time Inputs */}
        <Box display="flex" gap={2} mt={3} mb={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Date-Time"
              value={startDateTime}
              onChange={(newValue) => setStartDateTime(newValue)}
            />
            <DateTimePicker
              label="End Date-Time"
              value={endDateTime}
              onChange={(newValue) => setEndDateTime(newValue)}
            />
          </LocalizationProvider>
          <Button variant="contained" onClick={fetchAvailableRooms}>
            Check Availability
          </Button>
        </Box>

        {/* Available Rooms */}
        {loading ? (
          <CircularProgress />
        ) : (
          availableRooms.length > 0 && (
            <Box mt={3} width="100%">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Room Name</TableCell>
                    <TableCell>Room Floor</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableRooms
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Paginate rows
                    .map((room, index) => (
                      <TableRow key={room.roomId}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell> 
                        <TableCell>{room.roomName}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>{room.description}</TableCell>
                        <TableCell>
                          <Link
                            to = "/room-booking" variant="contained" 
                            color="primary" underline="none"
                            
                          >
                            Book Room
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
      </Box>
    </>
  );
};