import { Card, CardActionArea, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const LinkButton = ({ name, path, icon }) => (
  <Card
    sx={{
      width: 130,
      height: 130,
      padding: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 'auto',
      borderRadius: 3,
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', 
      background: 'linear-gradient(135deg,rgb(90, 209, 191),rgb(31, 153, 135))', 
      color: 'rgb(228, 231, 228)', 
      fontWeight: 'bold',
      cursor: 'pointer', 
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
      <Typography variant="h6" align="center">
        {name}
      </Typography>
    </CardActionArea>
  </Card>
);
