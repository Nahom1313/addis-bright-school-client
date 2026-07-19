import { LayoutDashboard, User, CalendarDays, BookOpen, Award, CheckSquare, Trophy, Video, BookMarked , GraduationCap, ClipboardCheck } from 'lucide-react';
export const STUDENT_NAV = [
  { to: '/student',             label: 'Overview',    icon: LayoutDashboard, end: true },
  { to: '/student/marks',       label: 'My Marks',    icon: Award },
  { to: '/student/homework',    label: 'Homework',    icon: BookMarked },
  { to: '/student/library',     label: 'Study Library', icon: BookOpen },
  { to: '/student/quizzes',     label: 'Practice Quizzes', icon: ClipboardCheck },
  { to: '/student/attendance',  label: 'Attendance',  icon: CheckSquare },
  { to: '/student/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/student/deadboard',   label: 'Deadboard',   icon: BookOpen },
  { to: '/student/calendar',   label: 'Calendar',  icon: GraduationCap },
  { to: '/student/events',      label: 'Events',      icon: CalendarDays },
  { to: '/student/meetings',    label: 'Meetings',    icon: Video },
  { to: '/student/profile',     label: 'My Profile',  icon: User },
];
