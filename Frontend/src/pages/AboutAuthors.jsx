import React from 'react';
import {
  Box, Typography, Avatar, Card, IconButton, Divider,
} from '@mui/material';
import { GitHub, LinkedIn, Facebook, Instagram } from '@mui/icons-material';

import may from '../assets/may.png';
import sasho from '../assets/sasho.png';
import edgar from '../assets/edgar.png'; // ✅ updated to /assets/edgar.jpg

const authors = [
  {
    name: 'May Phyu Sin Thant',
    photo: may,
    info1: 'MSc Computing, Edinburgh Napier University — 2024–2025',
    info2: 'Graduated BSc (Hons) Computing with First Class Honours, 2023–2024',
    extra: [
      '🏡 Homeland: 🇲🇲 Myanmar',
      '💼 Role: Project Manager & Back-End Developer',
      '✨ Hobbies:',
      '🎨 Drawing & Painting',
      '📑✏️ Writing Poems & Novels',
    ],
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' },
  },
  {
    name: 'Oleksandr Sharha',
    photo: sasho,
    info1: 'MSc Computing student at Edinburgh Napier University.',
    info2: 'Full-stack developer with a focus on React and Flask.',
    extra: [
      '🏡 Homeland: 🇺🇦 Ukraine',
      '💼 Role: Full-Stack Developer',
      '✨ Hobbies:',
      '💪 Arm-wrestling',
      '📚 Reading autobiographies',
    ],
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' },
  },
  {
    name: 'Edgar Nolove',
    photo: edgar,
    info1: 'MSc Computing student at Edinburgh Napier University.',
    info2: 'Passionate about backend systems and infrastructure.',
    extra: [
      '🏡 Homeland: 🇱🇹 Lithuania',
      '💼 Role: Backend Developer',
      '✨ Hobbies:',
      '🥋 Martial Arts',
      '⛸️ Ice Skating',
    ],
    social: { github: '#', linkedin: '#', facebook: '#', instagram: '#' },
  },
];

export const AboutAuthors = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <Typography variant="h4" align="center" gutterBottom>
        About the Authors
      </Typography>

      <Box
        sx={{
          width: '80%',
          mx: 'auto',
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {authors.map((author, index) => (
          <Box key={index}>
            <Card
              sx={{
                display: 'flex',
                p: 3,
                width: '100%',
                borderRadius: 3,
                boxShadow: 4,
                alignItems: 'center', // vertically center avatar + text
              }}
            >
              <Avatar
                src={author.photo}
                alt={author.name}
                sx={{
                  width: 110,
                  height: 110,
                  mr: 3,
                  border: '2px solid #ccc',
                  boxShadow: 3,
                  bgcolor: 'background.paper',
                }}
              />
              <Box flex={1}>
                <Typography variant="h6">{author.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {author.info1}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {author.info2}
                </Typography>

                {/* Extra info */}
                {author.extra && author.extra.map((line, idx) => (
                  <Typography key={idx} variant="body1" color="text.secondary" mt={0.5}>
                    {line}
                  </Typography>
                ))}

                {/* Social icons */}
                <Box mt={1}>
                  <IconButton href={author.social.facebook} target="_blank"><Facebook /></IconButton>
                  <IconButton href={author.social.instagram} target="_blank"><Instagram /></IconButton>
                  <IconButton href={author.social.github} target="_blank"><GitHub /></IconButton>
                  <IconButton href={author.social.linkedin} target="_blank"><LinkedIn /></IconButton>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body1" align="center" color="text.secondary">
        This project was developed as part of the MSc Computing coursework, showcasing a blend of backend, frontend, and design collaboration.
      </Typography>
    </Box>
  );
};
