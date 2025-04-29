import React, { useEffect, useState } from 'react';
import DialogBox from "../components/DialogBox"
import ConfirmDialog from "../components/ConfirmDialog";

import {
  Box, Typography, Autocomplete, TextField, Button,
  MenuItem, Select, InputLabel, FormControl, List, ListItem, Card, CardContent,
  IconButton, CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import { Delete, Edit } from '@mui/icons-material';

export const ClassSchedule = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [startbookingDate, setStartBookingDate] = useState('');
  const [endbookingDate, setEndBookingDate] = useState('');
  const [duration, setDuration] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [title, setTitle] = useState('');
  const [scheduleTypes, setScheduleTypes] = useState([]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update booking dates when startDateTime or duration changes
  useEffect(() => {
    if (startDateTime) {
      setStartBookingDate(dayjs(startDateTime).format('YYYY-MM-DD HH:mm:ss'));
      
      if (duration) {
        // Also update end date if duration exists
        const start = new Date(startDateTime);
        const [h, m] = duration.split(':').map(Number);
        const end = new Date(start);
        end.setHours(start.getHours() + h);
        end.setMinutes(start.getMinutes() + m);
        const formattedEndDate = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
        setEndDateTime(formattedEndDate);
        setEndBookingDate(formattedEndDate);
      }
    }
  }, [startDateTime, duration]);

  const fetchScheduleTypes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/schedule_type');
      const data = await res.json();
      setScheduleTypes(data.map(item => item.type)); 
    } catch (error) {
      console.error('Error fetching schedule types:', error);
      setIsDialogOpen(true);
      setDialogMessage("Failed to load schedule types");
    }
  }

  const fetchRoomTypes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/all_room_types');
      const data = await res.json();
      setRoomTypes(data.map(item => item.type));
    } catch (error) {
      console.error('Error fetching room types:', error);
      setIsDialogOpen(true);
      setDialogMessage("Failed to load room types");
    }
  };

  const fetchRooms = async () => {
    if (startbookingDate && endbookingDate && selectedType) {
      setIsLoading(true);
      const type = new URLSearchParams({
        start_date_time: startbookingDate,
        end_date_time: endbookingDate,
        roomType: selectedType,
      });
      
  
      try {
        const url = `http://localhost:5000/api/available_rooms?${type.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json(); 
        console.log("Available rooms:", data); 
        setRooms(data); 
      } catch (error) {
        console.error('Error fetching rooms:', error);
        
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (startbookingDate && endbookingDate && selectedType) {
      fetchRooms();
      setSelectedRoom(null); // Reset selected room when dependencies change
    }
  }, [startbookingDate, endbookingDate, selectedType]);
  
  const handleDurationChange = (event) => {
    const selectedDuration = event.target.value;
    setDuration(selectedDuration);
    
    if (startDateTime) {
      const start = new Date(startDateTime);
      const [hours, minutes] = selectedDuration.split(':').map(Number);
      const end = new Date(start);
      end.setHours(start.getHours() + hours);
      end.setMinutes(start.getMinutes() + minutes);

      const formattedEndDate = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
      setEndDateTime(formattedEndDate);
      setEndBookingDate(formattedEndDate);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/class_schedule');
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setIsDialogOpen(true);
      setDialogMessage("Failed to load schedules");
    }
  };

  const handleEdit = async (schedule) => {
    try {
      setSelectedType(schedule.room_type || '');
      setScheduleTitle(schedule.schedule_type);
      setTitle(schedule.title || '');
      
      // Format the date for datetime-local input
      const formattedStartDate = dayjs(schedule.start_date_time).format('YYYY-MM-DDTHH:mm');
      setStartDateTime(formattedStartDate);
      setStartBookingDate(dayjs(schedule.start_date_time).format('YYYY-MM-DD HH:mm:ss'));
      setEndBookingDate(dayjs(schedule.end_date_time).format('YYYY-MM-DD HH:mm:ss'));
    
      // Calculate duration
      const startMoment = dayjs(schedule.start_date_time);
      const endMoment = dayjs(schedule.end_date_time);
      const durationMinutes = endMoment.diff(startMoment, 'minute');
      const hours = Math.floor(durationMinutes / 60).toString().padStart(2, '0');
      const minutes = (durationMinutes % 60).toString().padStart(2, '0');
      setDuration(`${hours}:${minutes}`);
    
      // Fetch rooms first to populate options
      const type = new URLSearchParams({
        start_date_time: dayjs(schedule.start_date_time).format('YYYY-MM-DD HH:mm:ss'),
        end_date_time: dayjs(schedule.end_date_time).format('YYYY-MM-DD HH:mm:ss'),
        roomType: schedule.room_type,
      });
      
      const response = await fetch(`http://localhost:5000/api/available_rooms?${type.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const roomsData = await response.json();
      setRooms(roomsData);
      
      // Find the room in the fetched rooms
      const room = roomsData.find(r => r.roomId === schedule.room_id) || {
        roomId: schedule.room_id,
        roomName: schedule.room_name,
        floor: "Unknown" // If we can't find the floor, use "Unknown"
      };
      
      setSelectedRoom(room);
      setIsEditing(true);
      setEditingScheduleId(schedule.schedule_id);
    } catch (error) {
      console.error('Error setting up edit mode:', error);
      setIsDialogOpen(true);
      setDialogMessage("Failed to load room data for editing");
    }
  };
  
  const handleDeleteClick = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setConfirmOpen(true); 
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/delete_class_schedule/${selectedScheduleId}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        setIsDialogOpen(true);
        setDialogMessage("The schedule has been deleted successfully!");
        setSelectedScheduleId(null);
        setConfirmOpen(false); 
        fetchSchedules(); // Refresh after deletion
      } else {
        setIsDialogOpen(true);
        setDialogMessage("Failed to delete schedule!");
      }
    } catch (err) {
      setIsDialogOpen(true);
      setDialogMessage(`Delete error: ${err.message}`);
    }
  };
  
  const handleCreateSchedule = async () => {
    if (!selectedRoom || !scheduleTitle || !startDateTime || !duration) {
      setIsDialogOpen(true);
      setDialogMessage("Please fill all required fields");
      return;
    }

    const roomId = selectedRoom.roomId;
    
    if (!roomId) {
      setIsDialogOpen(true);
      setDialogMessage("Invalid room selection");
      return;
    }

    try {
      const start = new Date(startDateTime);
      const [h, m] = duration.split(':').map(Number);
      const end = new Date(start);
      end.setHours(start.getHours() + h);
      end.setMinutes(start.getMinutes() + m);

      const payload = {
        room_id: roomId,
        schedule_type: scheduleTitle,
        title: title,
        start_date_time: dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
        end_date_time: dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
      };

      const res = await fetch('http://localhost:5000/api/create_class_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDialogOpen(true);
        setDialogMessage("The schedule has been created successfully!");
        resetForm();
        fetchSchedules();
      } else {
        const errorData = await res.json();
        setIsDialogOpen(true);
        setDialogMessage(`Failed to create schedule: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setIsDialogOpen(true);
      setDialogMessage(`Error creating schedule: ${error.message}`);
    }
  };

  const resetForm = () => {
    setSelectedRoom(null);
    setSelectedType('');
    setScheduleTitle('');
    setStartDateTime('');
    setEndDateTime('');
    setStartBookingDate('');
    setEndBookingDate('');
    setDuration('');
    setTitle('');
    setIsEditing(false);
    setEditingScheduleId(null);
  };
  
  const handleUpdateSchedule = async () => {
    if (!selectedRoom || !scheduleTitle || !startDateTime || !duration || !editingScheduleId) {
      setIsDialogOpen(true);
      setDialogMessage("Please fill all required fields");
      return;
    }
  
    try {
      const start = new Date(startDateTime);
      const [h, m] = duration.split(':').map(Number);
      const end = new Date(start);
      end.setHours(start.getHours() + h);
      end.setMinutes(start.getMinutes() + m);
    
      const payload = {
        room_id: selectedRoom.roomId,
        title: title,
        room_type: selectedType,
        room_name: selectedRoom.roomName,
        schedule_type: scheduleTitle,
        start_date_time: dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
        end_date_time: dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
      };
    
      const res = await fetch(`http://localhost:5000/api/update_class_schedule/${editingScheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    
      if (res.ok) {
        setIsDialogOpen(true);
        setDialogMessage("The schedule has been updated successfully!");
        resetForm();
        fetchSchedules();
      } else {
        const errorData = await res.json();
        setIsDialogOpen(true);
        setDialogMessage(`Failed to update schedule: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setIsDialogOpen(true);
      setDialogMessage(`Error updating schedule: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchScheduleTypes();
    fetchRoomTypes();
    fetchSchedules();
  }, []);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <DialogBox 
        open={isDialogOpen} 
        message={dialogMessage} 
        onClose={() => setIsDialogOpen(false)} 
      />

      <ConfirmDialog
        open={confirmOpen}
        message="Are you sure you want to delete this schedule?"
        onClose={() => setConfirmOpen(false)}  
        onConfirm={handleConfirmDelete}  
      />

      <Typography variant="h4">Class Schedule Management</Typography>

      <Autocomplete
        options={roomTypes}
        value={selectedType}
        onChange={(e, value) => setSelectedType(value)}
        renderInput={(params) => <TextField {...params} label="Room Type" />}
        sx={{ width: 350 }}
      />

      <TextField
        label="Booking Time"
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
        value={startDateTime}
        onChange={(e) => setStartDateTime(e.target.value)}
        sx={{ width: 350 }}
        inputProps={{ min: new Date().toISOString().slice(0, 16) }}
      />

      <FormControl sx={{ width: 350 }}>
        <InputLabel id="duration-label">Duration</InputLabel>
        <Select
          labelId="duration-label"
          value={duration}
          onChange={handleDurationChange}
          label="Duration"
        >
          {['00:30', '01:00', '01:30', '02:00', '02:30', '03:00'].map(dur => (
            <MenuItem key={dur} value={dur}>{dur.replace(':', 'h ') + 'min'}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        options={rooms}
        value={selectedRoom}
        onChange={(e, value) => setSelectedRoom(value)}
        getOptionLabel={(option) => option.roomName || 'No available rooms'} 
        renderInput={(params) => (
          <TextField {...params} label="Select Room" />
        )}
        sx={{ width: 350 }}
        disabled={isLoading || rooms.length === 0} 

        renderOption={(props, option) => (
          <li {...props} key={option.roomId}> 
            {option.roomName}
          </li>
        )}
      />

      <FormControl sx={{ width: 350 }}>
        <InputLabel id="type-label">Schedule Type</InputLabel>
        <Select
          labelId="type-label"
          value={scheduleTitle}
          onChange={(e) => setScheduleTitle(e.target.value)}
          label="Schedule Type"
        >
          {scheduleTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Schedule Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ width: 350 }}
      />

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={isEditing ? handleUpdateSchedule : handleCreateSchedule}
          disabled={!selectedRoom || !scheduleTitle || !startDateTime || !duration}
        >
          {isEditing ? 'Update Schedule' : 'Create Schedule'}
        </Button>
        {isEditing && (
          <Button variant="outlined" color="warning" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </Box>

      <Box mt={4} width="80%">
        <Typography variant="h6" gutterBottom>Current Schedules</Typography>
        <List>
          {schedules.map((schedule) => (
            <ListItem key={schedule.schedule_id}>
              <Card sx={{ width: '100%', p: 2 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h6">Room - {schedule.room_name}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Room Type - </strong> {schedule.room_type}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Schedule Type - </strong>  {schedule.schedule_type}</Typography>
                    <Typography variant="body2" color="text.secondary" ><strong>Schedule Title - </strong> {schedule.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong> Booking Duration - </strong>{dayjs(schedule.start_date_time).format('YYYY-MM-DD HH:mm')} - {dayjs(schedule.end_date_time).format('HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary"> <strong> Status - </strong> {schedule.status}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton color="primary" size="small" onClick={() => handleEdit(schedule)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDeleteClick(schedule.schedule_id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};