import { Map, History, LibraryBooks, School, MeetingRoom, Navigation } from '@mui/icons-material';
import route from '../public/icons/route.png';
import map_info from '../public/icons/map_info.png';
import history from '../public/icons/history.png';
import library_info from '../public/icons/library_info.png';
import campus from '../public/icons/campus.png';
import book_room from '../public/icons/book_room.png';

export const pages = [
  { name: 'Navigation', path: '/navigation', icon: route },
  { name: 'Plan info', path: '/plan-info', icon: map_info },
  { name: 'Nav history', path: '/nav-history', icon: history },
  { name: 'Library info', path: '/library-info', icon: library_info },
  { name: 'Campus info', path: '/campus-info', icon: campus },
  { name: 'Book room', path: '/room-booking', icon: book_room },
];
