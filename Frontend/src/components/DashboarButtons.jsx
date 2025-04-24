import { Box, Container } from '@mui/material';
import { CardButton } from './CardButton';
import { pages } from '../pages';

export const DashboarButtons = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{ maxWidth: '600px', margin: '70px 5px' }}
        display="grid"
        gridTemplateColumns= {{xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)'}}
        gap={{xs: 4, md: 3}}
        mt={3}
        alignSelf="center"
        justifyContent="center"
        alignItems="center"
        justifyItems="center" // Ensures each item is centered in its grid cell
      >
        {pages.map(({ name, path, icon }, index) => (
          <CardButton key={index} name={name} path={path} icon={icon} />
        ))}
      </Box>
    </Container>
  );
};
