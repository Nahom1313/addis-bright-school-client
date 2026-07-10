import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import MeetingsPanel from '@/components/shared/MeetingsPanel';
import { useMe } from '@/hooks/useAuth';
import { STUDENT_NAV } from './nav';

const StudentMeetingsPage = () => {
  const { data: me } = useMe();
  const sectionId = me?.sectionId?._id || me?.sectionId || null;

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title="Virtual Meetings" subtitle="Join meetings for your class" />
      <MeetingsPanel sectionId={sectionId} title="Upcoming Meetings" />
    </AppShell>
  );
};

export default StudentMeetingsPage;
