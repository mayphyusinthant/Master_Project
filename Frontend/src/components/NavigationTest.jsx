import { Box } from '@mui/material';
import BuildingPlan from '../assets/building_plan.svg'; // Adjust the path accordingly

export const NavigationTest = () => {
  return (
    <div>
      <h1>Building Plan</h1>
      <Box mt={3} mb={2} position="relative" textAlign="right">
        <img src={BuildingPlan} alt="Building Plan" />
      </Box>
    </div>
  );
};
