import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EventsCalendar from '@/components/shared/EventsCalendar';
import { STUDENT_NAV } from './nav';

const StudentEventsPage = () => (
  <AppShell navItems={STUDENT_NAV}>
    <PageHeader title="Events" subtitle="Your upcoming school events and deadlines" />
    <EventsCalendar title="Upcoming Events" />
  </AppShell>
);
export default StudentEventsPage;
