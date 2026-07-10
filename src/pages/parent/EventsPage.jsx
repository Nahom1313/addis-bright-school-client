import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EventsCalendar from '@/components/shared/EventsCalendar';
import { PARENT_NAV } from './nav';

const ParentEventsPage = () => (
  <AppShell navItems={PARENT_NAV}>
    <PageHeader title="Events" subtitle="Upcoming school and class events" />
    <EventsCalendar title="Upcoming Events" />
  </AppShell>
);
export default ParentEventsPage;
