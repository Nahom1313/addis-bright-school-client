import { LayoutDashboard, Users, ClipboardList, CalendarDays, BookOpen, CheckSquare, Video, Calendar, MessageCircle, BookMarked, Crown , GraduationCap } from 'lucide-react';
export const TEACHER_NAV = [
  { to: '/teacher',              label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/teacher/classes',      label: 'My Classes',   icon: Users },
  { to: '/teacher/program',      label: 'My Program',   icon: Calendar },
  { to: '/teacher/grade-entry',  label: 'Grade Entry',  icon: BookOpen },
  { to: '/teacher/attendance',   label: 'Attendance',   icon: CheckSquare },
  { to: '/teacher/homework',     label: 'Homework',     icon: BookMarked },
  { to: '/teacher/class-leader', label: 'Class Leader', icon: Crown },
  { to: '/teacher/calendar',   label: 'Calendar',  icon: GraduationCap },
  { to: '/teacher/logs',         label: 'Status Logs',  icon: ClipboardList },
  { to: '/teacher/messages',     label: 'Messages',     icon: MessageCircle },
  { to: '/teacher/events',       label: 'Events',       icon: CalendarDays },
  { to: '/teacher/meetings',     label: 'Meetings',     icon: Video },
];
