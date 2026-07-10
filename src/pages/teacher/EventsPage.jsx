import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EventsCalendar from '@/components/shared/EventsCalendar';
import { TEACHER_NAV } from './nav';

const TeacherEventsPage = () => (
  <AppShell navItems={TEACHER_NAV}>
    <PageHeader title="Events" subtitle="School-wide and class events" />
    <EventsCalendar showCreate title="Upcoming Events" />
  </AppShell>
);
export default TeacherEventsPage;
