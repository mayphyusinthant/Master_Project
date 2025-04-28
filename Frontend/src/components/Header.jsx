import { useTheme } from '@emotion/react';
import { AppBar, Container, FormControlLabel, IconButton, Switch, Toolbar, Tooltip, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../theme/ColorModeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const Header = () => {

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark';
  const headerBackground = theme.palette.header.background; 
  const navigate = useNavigate();


return (

    <AppBar position="static" sx={{ textAlign: 'left', backgroundColor: headerBackground }}>
      <Container maxWidth="md">
        <Toolbar>
          <Link to="/">
            <img
              src="../../public/favicon.png"
              alt="Logo"
              style={{ height: '50px', marginRight: '10px', marginLeft: '10px' }}
            />
          </Link>
          <Typography variant="h4" sx={{ flexGrow: 1, fontFamily: 'monospace', fontWeight: 'bold', fontStyle: 'italic' }}>
            Navigator
          </Typography>
    

<FormControlLabel
          control={
            <Switch
              checked={isDark}
              onChange={colorMode.toggleColorMode}
              icon={<Brightness7 sx={{ color: '#fdd835' }} />} // Sun
              checkedIcon={<Brightness4 sx={{ color: '#90caf9' }} />} // Moon
              sx={{
                mr: -1,
                
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#fff',
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: isDark ? '#90caf9' : '#fdd835',
                },
              }}
            />
          }
          label=""
        />
        <Tooltip title="Admin"  >
  <IconButton sx={{ml: "-3"}}  color="inherit" onClick={() => navigate('/admin')}>
    <AdminPanelSettingsIcon sx={{ml: "-3"}}/>
  </IconButton>
</Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
   
)

}
  
  
