import { LayoutDashboard, UserPlus, Users, GraduationCap, BookOpen, CreditCard, ClipboardList, BarChart3 } from 'lucide-react';
export const REGISTRAR_NAV = [
  { to: '/registrar',                 label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/registrar/students',        label: 'Students',        icon: Users },
  { to: '/registrar/teachers',        label: 'Teachers',        icon: GraduationCap },
  { to: '/registrar/parents',         label: 'Parents',         icon: UserPlus },
  { to: '/registrar/timetable',       label: 'Timetables',      icon: BookOpen },
  { to: '/registrar/payments',        label: 'Payments',        icon: CreditCard },
  { to: '/registrar/calendar', label: 'Calendar',  icon: GraduationCap },
  { to: '/registrar/section-reports', label: 'Section Reports', icon: ClipboardList },
  { to: '/registrar/analytics',       label: 'Analytics',       icon: BarChart3 },
];
