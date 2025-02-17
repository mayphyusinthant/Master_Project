import { Box, Autocomplete, TextField } from '@mui/material';
import image from '../assets/banner.png'; // Replace with your actual image path

const locations = ['New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney'];

export const Navigation = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
      <Box mt={3} display="flex" justifyContent="center" gap={2} width="100%">
        <Autocomplete
          options={locations || []}
          renderInput={(params) => <TextField {...params} label="FROM" variant="outlined" />}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={locations || []}
          renderInput={(params) => <TextField {...params} label="TO" variant="outlined" />}
          sx={{ width: 250 }}
        />
      </Box>

      <Box mt={2} display="flex" justifyContent="center">
        <img src={image} alt="Map" style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    </Box>
  );
};
