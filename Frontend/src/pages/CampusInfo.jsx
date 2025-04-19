import { PageTitle } from '../components/pageTitle';
import { Box, Container, Typography, Grid, List, ListItem, ListItemText, Paper, Link } from '@mui/material';
import image from '../assets/campus_bg.png';

export const CampusInfo = () => {
  return (
    <>
      <PageTitle title="Campus Information" />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box mb={4}>
          <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
            Built around the historic 16th-century birthplace and home of our very own John Napier, Merchiston campus is home to our 
            creative, computing and engineering students. Situated in the buzzing neighbourhood of Bruntsfield, independent cafes,
            restaurants and shops are just around the corner.
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}>
          Facilities
        </Typography>

        <Grid container spacing={4} mb={4}>
          <Grid item xs={12} md={5}>
            <List disablePadding>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="500-seat Jack Kilby Computing Centre, open 24 hours a day in Trimesters 1 and 2" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="State-of-the-art music studios" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="TV and radio studios" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="Newsroom" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="Computer games lab" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="Networking labs featuring the latest Cisco kit" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="Bright Red Triangle business incubator" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemText primary="VBase volunteering centre" />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Box component="img" src={image} alt="Banner" width="100%" sx={{ display: 'block' }} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%' }}>
              <Box p={1}>
                <Typography variant="button" component="span" sx={{ mr: 2, fontWeight: 'bold' }}>
                  Map
                </Typography>
                <Typography variant="button" component="span" sx={{ color: 'text.secondary' }}>
                  Satellite
                </Typography>
              </Box>
              
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2234.2734831965206!2d-3.2140567839605756!3d55.9339799805841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887c7a3aa165deb%3A0x52c19d9f0f0148e3!2sEdinburgh%20Napier%20University%20Merchiston%20Campus!5e0!3m2!1sen!2suk!4v1651067234574!5m2!1sen!2suk"
                sx={{
                  border: 0,
                  width: '100%',
                  height: '400px',
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
              Merchiston Campus
            </Typography>
            <Typography variant="body2" paragraph>
              10 Colinton Road
            </Typography>
            <Typography variant="body2" paragraph>
              Edinburgh
            </Typography>
            <Typography variant="body2" paragraph>
              EH10 5DT
            </Typography>
            <Typography variant="body2" paragraph>
              0131 455 2929
            </Typography>
            <Link href="mailto:reception@napier.ac.uk" color="inherit" underline="hover">
              reception@napier.ac.uk
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
