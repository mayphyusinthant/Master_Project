import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Autocomplete, TextField, Button,
  MenuItem, Select, InputLabel, FormControl, List, ListItem, Card, CardContent,
  IconButton
} from '@mui/material';
import dayjs from 'dayjs';
import { Delete, Edit } from '@mui/icons-material';

export const ClassSchedule = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [duration, setDuration] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [title, setTitle] = useState('');

  const fetchRoomTypes = async () => {
    const res = await fetch('http://localhost:5000/api/all_room_types');
    const data = await res.json();
    setRoomTypes(data.map(item => item.type));
  };

  const fetchRooms = async (type) => {
    const url = `http://localhost:5000/api/available_rooms?roomType=${type}`;
    const res = await fetch(url);
    const data = await res.json();
    setRooms(data);
  };

  const fetchSchedules = async () => {
    const res = await fetch('http://localhost:5000/api/class_schedule');
    const data = await res.json();
    setSchedules(data);
  };

  const handleEdit = async (schedule) => {
    setSelectedType(schedule.room_type || '');
    setScheduleTitle(schedule.schedule_type);
    setTitle(schedule.title || '');
    setStartDateTime(dayjs(schedule.start_date_time).format('YYYY-MM-DDTHH:mm'));
  
    const durationMinutes = dayjs(schedule.end_date_time).diff(dayjs(schedule.start_date_time), 'minute');
    const h = Math.floor(durationMinutes / 60).toString().padStart(2, '0');
    const m = (durationMinutes % 60).toString().padStart(2, '0');
    setDuration(`${h}:${m}`);
  
    // Fetch rooms for that type, then set the selected room
    await fetchRooms(schedule.room_type);
    const room = rooms.find(r => r.roomId === schedule.room_id);
    setSelectedRoom(room || '');
  
    setIsEditing(true);
    setEditingScheduleId(schedule.schedule_id);
  };
  
  
  
  
  const handleDelete = async (scheduleId) => {
    const confirm = window.confirm("Are you sure you want to delete this schedule?");
    if (!confirm) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/delete_class_schedule/${scheduleId}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        fetchSchedules(); // Refresh after deletion
      } else {
        alert("Failed to delete schedule");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  

  const handleCreateSchedule = async () => {
    const selected = typeof selectedRoom === 'string'
      ? rooms.find(r => r.roomName === selectedRoom)
      : selectedRoom;

    if (!selected || !scheduleTitle || !startDateTime || !duration) return;

    const start = new Date(startDateTime);
    const [h, m] = duration.split(':').map(Number);
    const end = new Date(start);
    end.setHours(start.getHours() + h);
    end.setMinutes(start.getMinutes() + m);

    const payload = {
      room_id: selected.roomId,
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
      resetForm();
      fetchSchedules();
    }
  };

  const resetForm = () => {
    setSelectedRoom('');
    setSelectedType('');
    setScheduleTitle('');
    setStartDateTime('');
    setDuration('');
    setTitle(''); // ← this was missing!
    setIsEditing(false);
    setEditingScheduleId(null);
  };
  
  const handleUpdateSchedule = async () => {
    const selected = typeof selectedRoom === 'string'
      ? rooms.find(r => r.roomName === selectedRoom)
      : selectedRoom;
  
    if (!selected || !scheduleTitle || !startDateTime || !duration || !editingScheduleId) return;
  
    const start = new Date(startDateTime);
    const [h, m] = duration.split(':').map(Number);
    const end = new Date(start);
    end.setHours(start.getHours() + h);
    end.setMinutes(start.getMinutes() + m);
  
    const payload = {
      room_id: selected.roomId,
        title: title,
        room_type: selectedType,
        room_name: selected.roomName,
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
      resetForm();
      fetchSchedules();
    }
  };
  

  useEffect(() => {
    fetchRoomTypes();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchRooms(selectedType);
      setSelectedRoom('');
    }
  }, [selectedType]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <Typography variant="h4">Class Schedule Management</Typography>

      <Autocomplete
        options={roomTypes}
        value={selectedType}
        onChange={(e, value) => setSelectedType(value)}
        renderInput={(params) => <TextField {...params} label="Room Type" />}
        sx={{ width: 350 }}
      />

      <Autocomplete
        options={rooms}
        getOptionLabel={(opt) => typeof opt === 'string' ? opt : `${opt.roomName} (${opt.floor})`}
        value={selectedRoom}
        onChange={(e, value) => setSelectedRoom(value)}
        renderInput={(params) => <TextField {...params} label="Room Number" />}
        sx={{ width: 350 }}
        disabled={!selectedType}
      />

<FormControl sx={{ width: 350 }}>
  <InputLabel id="type-label">Schedule Type</InputLabel>
  <Select
    labelId="type-label"
    value={scheduleTitle}
    onChange={(e) => setScheduleTitle(e.target.value)}
    label="Schedule Type"
  >
    {["Lecture", "Practical", "Exam", "Meeting", "ENSA Event", "Other Event"].map(type => (
      <MenuItem key={type} value={type}>{type}</MenuItem>
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
          onChange={(e) => setDuration(e.target.value)}
          label="Duration"
        >
          {['00:30', '01:00', '01:30', '02:00', '02:30', '03:00'].map(dur => (
            <MenuItem key={dur} value={dur}>{dur.replace(':', 'h ') + 'min'}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" gap={2}>
  <Button
    variant="contained"
    onClick={isEditing ? handleUpdateSchedule : handleCreateSchedule}
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
            <Typography variant="h6">{schedule.room_name}</Typography>
            <Typography variant="body2">{schedule.schedule_type}</Typography>
            <Typography variant="body2">
              {dayjs(schedule.start_date_time).format('YYYY-MM-DD HH:mm')} - {dayjs(schedule.end_date_time).format('HH:mm')}
            </Typography>
            <Typography variant="body2"><strong>Title:</strong> {schedule.title}</Typography>
            <Typography variant="body2">Status: {schedule.status}</Typography>
            <Typography variant="body2"><strong>Room Type:</strong> {schedule.room_type}</Typography>

          </Box>
          <Box display="flex" gap={1}>
            <IconButton variant="outlined" color="primary" size="small" onClick={() => handleEdit(schedule)}>
             <Edit />
            </IconButton>
            <IconButton variant="outlined" color="error" size="small" onClick={() => handleDelete(schedule.schedule_id)}>
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
