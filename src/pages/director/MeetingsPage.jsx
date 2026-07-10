import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import MeetingsPanel from '@/components/shared/MeetingsPanel';
import { DIRECTOR_NAV } from './nav';

const DirectorMeetingsPage = () => (
  <AppShell navItems={DIRECTOR_NAV}>
    <PageHeader title="Virtual Meetings" subtitle="Schedule and host video meetings with parents, teachers, and students" />
    <MeetingsPanel showCreate title="All Upcoming Meetings" />
  </AppShell>
);

export default DirectorMeetingsPage;
