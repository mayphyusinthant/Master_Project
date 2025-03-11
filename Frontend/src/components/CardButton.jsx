import { Card, CardActionArea, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const CardButton = ({ name, path, icon }) => (
  <Card
    sx={{
      width: 120, // Set a fixed width for all cards
      height: 120,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 'auto',
    }}
  >
    <CardActionArea
      component={Link}
      to={path}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {icon}
      <Typography variant="h6" align="center">
        {name}
      </Typography>
    </CardActionArea>
  </Card>
);
