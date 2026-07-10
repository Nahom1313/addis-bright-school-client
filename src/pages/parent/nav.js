import { Activity, CalendarDays, CreditCard, User, CheckSquare, Video, FileText, BookMarked, MessageCircle , GraduationCap } from 'lucide-react';
export const PARENT_NAV = [
  { to: '/parent',              label: 'Timeline',    icon: Activity,       end: true },
  { to: '/parent/attendance',   label: 'Attendance',  icon: CheckSquare },
  { to: '/parent/homework',     label: 'Homework',    icon: BookMarked },
  { to: '/parent/messages',     label: 'Messages',    icon: MessageCircle },
  { to: '/parent/report-card',  label: 'Report Card', icon: FileText },
  { to: '/parent/calendar',    label: 'Calendar',  icon: GraduationCap },
  { to: '/parent/events',       label: 'Events',      icon: CalendarDays },
  { to: '/parent/meetings',     label: 'Meetings',    icon: Video },
  { to: '/parent/payment',      label: 'Payments',    icon: CreditCard },
  { to: '/parent/profile',      label: 'Profile',     icon: User },
];
