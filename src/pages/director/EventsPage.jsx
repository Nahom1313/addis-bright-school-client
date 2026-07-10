import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EventsCalendar from '@/components/shared/EventsCalendar';
import { DIRECTOR_NAV } from './nav';

const DirectorEventsPage = () => (
  <AppShell navItems={DIRECTOR_NAV}>
    <PageHeader title="School Events" subtitle="Manage school-wide and section events" />
    <EventsCalendar showCreate title="All Upcoming Events" />
  </AppShell>
);
export default DirectorEventsPage;
