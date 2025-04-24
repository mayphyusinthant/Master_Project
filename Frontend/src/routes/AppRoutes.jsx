import { Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from '../pages/MainPage';
import { Navigation } from '../pages/Navigation';
import { PlanInfo } from '../pages/PlanInfo';
import { NavHistory } from '../pages/NavHistory';
import { LibraryInfo } from '../pages/LibraryInfo';
import { CampusInfo } from '../pages/CampusInfo';
import { RoomBooking } from '../pages/RoomBooking';
import { AdminLayout } from '../pages/AdminLayout';
import {ClassSchedule} from '../pages/ClassSchedule';
import { LibraryRooms } from '../pages/LibraryRooms';
import { AboutAuthors } from '../pages/AboutAuthors';
import { Container } from '@mui/material';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/navigation" element={<Navigation />} />
    <Route path="/plan-info" element={<PlanInfo />} />
    <Route path="/nav-history" element={<NavHistory />} />
    <Route path="/library-info" element={<LibraryInfo />} />
    <Route path="/campus-info" element={<CampusInfo />} />
    <Route path="/room-booking" element={<RoomBooking />} />
    
    <Route path="/admin" element={<AdminLayout />}>
    
      
    <Route index element={<Navigate to="/admin/schedule" />} />
    <Route path="schedule" element={<ClassSchedule />} />
    <Route path="library" element={<LibraryRooms />} />
    <Route path="about" element={<AboutAuthors />} />
    </Route>
    
  </Routes>
);
