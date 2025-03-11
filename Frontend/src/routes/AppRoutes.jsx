import { Routes, Route } from 'react-router-dom';
import { MainPage } from '../pages/MainPage';
import { Navigation } from '../pages/Navigation';
import { PlanInfo } from '../pages/PlanInfo';
import { NavHistory } from '../pages/NavHistory';
import { LibraryInfo } from '../pages/LibraryInfo';
import { CampusInfo } from '../pages/CampusInfo';
import { RoomBooking } from '../pages/RoomBooking';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/navigation" element={<Navigation />} />
    <Route path="/plan-info" element={<PlanInfo />} />
    <Route path="/nav-history" element={<NavHistory />} />
    <Route path="/library-info" element={<LibraryInfo />} />
    <Route path="/campus-info" element={<CampusInfo />} />
    <Route path="/room-booking" element={<RoomBooking />} />
  </Routes>
);
