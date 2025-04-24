import React from 'react';
import {
  Box, Typography, Grid, Avatar, Card, IconButton, Divider
} from '@mui/material';
import { GitHub, LinkedIn, Facebook, Instagram } from '@mui/icons-material';

const authors = [
  {
    name: 'Will Smith',
    photo: '/img/oleksandr.jpg',
    info1: 'MSc Computing student at Edinburgh Napier University.',
    info2: 'Full-stack developer with a focus on React and Flask.',
    social: {
      github: '#',
      linkedin: '#',
      facebook: '#',
      instagram: '#'
    }
  },
  {
    name: 'Jane Doe',
    photo: '/img/jane.jpg',
    info1: 'UX/UI Designer with 5 years of experience.',
    info2: 'Passionate about accessibility and user-centered design.',
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' }
  },
  {
    name: 'John Smith',
    photo: '/img/john.jpg',
    info1: 'Backend engineer, Flask & MySQL enthusiast.',
    info2: 'Enjoys building scalable APIs and microservices.',
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' }
  },
  {
    name: 'Maria Lopez',
    photo: '/img/maria.jpg',
    info1: 'Frontend wizard with React and Vue.',
    info2: 'Believes in clean code and collaborative development.',
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' }
  }
];

export const AboutAuthors = () => {
  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography variant="h4" align="center" gutterBottom>
        About the Authors
      </Typography>

      <Grid container spacing={4}>
        {authors.map((author, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ display: 'flex', p: 3, width: '100%', borderRadius: 3, boxShadow: 4 }}>
              <Avatar
                src={author.photo}
                alt={author.name}
                sx={{ width: 100, height: 100, mr: 3 }}
              />
              <Box flex={1}>
                <Typography variant="h6">{author.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {author.info1}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {author.info2}
                </Typography>
                <Box mt={1}>
                  <IconButton href={author.social.facebook} target="_blank"><Facebook /></IconButton>
                  <IconButton href={author.social.instagram} target="_blank"><Instagram /></IconButton>
                  <IconButton href={author.social.github} target="_blank"><GitHub /></IconButton>
                  <IconButton href={author.social.linkedin} target="_blank"><LinkedIn /></IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body1" align="center" color="text.secondary">
        This project was developed as part of the MSc Computing coursework, showcasing a blend of backend, frontend, and design collaboration.
      </Typography>
    </Box>
  );
};
