import { useTheme } from '@emotion/react';
import { AppBar, Container, FormControlLabel, IconButton, Switch, Toolbar, Typography } from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ColorModeContext } from '../theme/ColorModeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export const Header = () => {

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark';


return (

    <AppBar position="static" sx={{ textAlign: 'left', backgroundColor: '#FF5050' }}>
      <Container maxWidth="md">
        <Toolbar>
          <Link to="/">
            <img
              src="../../public/favicon.png"
              alt="Logo"
              style={{ height: '40px', marginRight: '16px' }}
            />
          </Link>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
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
        </Toolbar>
      </Container>
    </AppBar>
   
)

}
  
  
