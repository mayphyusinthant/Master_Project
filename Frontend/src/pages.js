import { Map, History, LibraryBooks, School, MeetingRoom, Navigation } from '@mui/icons-material';

export const pages = [
  { name: 'Navigation', path: '/navigation', icon: Navigation },
  { name: 'Plan info', path: '/plan-info', icon: Map },
  { name: 'Nav history', path: '/nav-history', icon: History },
  { name: 'Library info', path: '/library-info', icon: LibraryBooks },
  { name: 'Campus info', path: '/campus-info', icon: School },
  { name: 'Book room', path: '/room-booking', icon: MeetingRoom },
];
