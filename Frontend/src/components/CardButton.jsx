import { Card, CardActionArea, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const CardButton = ({ name, path, icon }) => (
  <Card
    sx={{
      width: 130,
      height: 130,
      padding: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 'auto',
      borderRadius: 3, // Softer corners
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Subtle shadow
      background: 'linear-gradient(135deg,rgb(90, 209, 191),rgb(31, 153, 135))', // Gradient effect
      color: 'rgb(228, 231, 228)', // Text color
      fontWeight: 'bold',
      cursor: 'pointer', // Button-like behavior
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
      },
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
      <img src={icon} alt={name} style={{ width: '60%', height: '60%', marginBottom: 4 }} />
      <Typography variant="h6" align="center">
        {name}
      </Typography>
    </CardActionArea>
  </Card>
);
