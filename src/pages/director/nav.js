import { LayoutDashboard, Users, BookOpen, ClipboardList, Building2, CalendarDays, BarChart3, Upload, Settings, Video , GraduationCap } from 'lucide-react';
export const DIRECTOR_NAV = [
  { to: '/director',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/director/calendar',  label: 'Calendar',  icon: GraduationCap },
  { to: '/director/users',       label: 'Users',       icon: Users },
  { to: '/director/grades',      label: 'Grades',      icon: BookOpen },
  { to: '/director/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/director/events',      label: 'Events',      icon: CalendarDays },
  { to: '/director/meetings',    label: 'Meetings',    icon: Video },
  { to: '/director/analytics',   label: 'Analytics',   icon: BarChart3 },
  { to: '/director/school',      label: 'School Info', icon: Building2 },
  { to: '/director/import',      label: 'Bulk Import', icon: Upload },
  { to: '/director/settings',    label: 'Settings',    icon: Settings },
];
