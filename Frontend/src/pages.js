import { Map, History, LibraryBooks, School, MeetingRoom, Navigation } from '@mui/icons-material';
import route from './assets/icons/route.png';
import map_info from './assets/icons/map_info.png';
import history from './assets/icons/history.png';
import library_info from './assets/icons/library_info.png';
import campus from './assets/icons/campus.png';
import book_room from './assets/icons/book_room.png';

export const pages = [
  { name: 'Navigation', path: '/navigation', icon: route },
  { name: 'Plan info', path: '/plan-info', icon: map_info },
  { name: 'Nav history', path: '/nav-history', icon: history },
  { name: 'Library info', path: '/library-info', icon: library_info },
  { name: 'Campus info', path: '/campus-info', icon: campus },
  { name: 'Book room', path: '/room-booking', icon: book_room },
];
