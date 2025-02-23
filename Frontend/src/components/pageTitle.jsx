import { Typography } from '@mui/material';

export const PageTitle = ({ title }) => (
  <Typography variant="h5" sx={{ textAlign: 'center', margin: '10px 0' }}>
    {title}
  </Typography>
);
