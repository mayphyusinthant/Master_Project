import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    
  } from '@mui/material';
  import { Outlet, useLocation, useNavigate } from 'react-router-dom';
  import EventNoteIcon from '@mui/icons-material/EventNote';
  import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
  import InfoIcon from '@mui/icons-material/Info';
  
  const menuItems = [
    { text: 'Class Schedule', icon: <EventNoteIcon />, path: '/admin/schedule' },
    { text: 'Library Rooms', icon: <MeetingRoomIcon />, path: '/admin/library' },
    { text: 'About Authors', icon: <InfoIcon />, path: '/admin/about' },
  ];
  
  export const AdminLayout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    
    return (
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar (inside container, below header and above footer) */}
        <Box
          sx={{
            width: { xs: 60, sm: 220 },
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.header.background,
            color: "white",
            display: 'flex',
            flexDirection: 'column',
            pt: 2,
            ml:-3,
            
          }}
        >
          <List>
            {menuItems.map(({ text, icon, path }) => (
              <ListItemButton
                key={text}
                selected={location.pathname === path}
                onClick={() => navigate(path)}
                
                sx={{
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  px: 2,
                  
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: { sm: 2 }, justifyContent: 'center' }}>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ display: { xs: 'none', sm: 'block' } }} />
              </ListItemButton>
            ))}
          </List>
            
        </Box>
  
        {/* Page Content next to the sidebar */}
        <Box sx={{ flexGrow: 1, p: 2, minHeight: '100vh' }}>
  <Outlet />
</Box>
     </Box>
    );
  };
  