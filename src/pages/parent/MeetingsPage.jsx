import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import MeetingsPanel from '@/components/shared/MeetingsPanel';
import { useMe } from '@/hooks/useAuth';
import { PARENT_NAV } from './nav';

const ParentMeetingsPage = () => {
  const { data: me } = useMe();
  // Use first child's sectionId so section-scoped meetings are visible
  const firstChild = me?.studentIds?.[0];
  const sectionId = firstChild?.sectionId?._id || firstChild?.sectionId || null;

  return (
    <AppShell navItems={PARENT_NAV}>
      <PageHeader title="Virtual Meetings" subtitle="Join meetings scheduled for your children" />
      <MeetingsPanel sectionId={sectionId} title="Upcoming Meetings" />
    </AppShell>
  );
};

export default ParentMeetingsPage;
