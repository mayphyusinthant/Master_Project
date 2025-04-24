import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Divider,
    Button,
  } from '@mui/material';
  import { Delete, ArrowForward } from '@mui/icons-material';
  import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'; // dot icon
  
  export const NavHistoryCard = ({ route, onRepeat, onDelete }) => {
    const { from_room, to_room, floor_from, floor_to, timestamp } = route;
    
    
  
    return (
      <Card sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          {/* Header: timestamp */}
          <Box display="flex" justifyContent="space-between" alignItems="center">

          <Typography variant="body1" gutterBottom>
            {timestamp}
          </Typography>
          <IconButton variant="contained" color="error" onClick={onDelete} >
              <Delete />
            </IconButton>
          </Box>
          
  
          {/* Route steps */}
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FiberManualRecordIcon fontSize="small" sx={{ mr: 1, ml:0.5 }} />
              <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem',  fontStyle:"italic" }}>
  {from_room} ({floor_from}) 
</Typography>

            </Box>
            <Divider sx={{ ml: 1.5, borderLeft: '4px solid #ccc', borderBottom: 'none', height: 20 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <FiberManualRecordIcon fontSize="small" sx={{ mr: 1, ml:0.5 }} />
              <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem', fontStyle:"italic" }}>{to_room} ({floor_to})</Typography>
            </Box>
          </Box>
  
          {/* Action buttons */}
          <Box display="flex" justifyContent="center" mt={2}>
          
            <Button color="success" variant="contained" onClick={onRepeat} endIcon={<ArrowForward />}>
              Navigate
            </Button>
            
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  