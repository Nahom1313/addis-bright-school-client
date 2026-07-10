import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import MeetingsPanel from '@/components/shared/MeetingsPanel';
import { useMe } from '@/hooks/useAuth';
import { TEACHER_NAV } from './nav';

const TeacherMeetingsPage = () => {
  const { data: me } = useMe();
  // Pass teacher's first assigned sectionId so section-scoped meetings are visible
  const sectionId = me?.sectionId?._id || me?.sectionId || null;

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title="Virtual Meetings" subtitle="Schedule and join meetings" />
      <MeetingsPanel showCreate sectionId={sectionId} title="Upcoming Meetings" />
    </AppShell>
  );
};

export default TeacherMeetingsPage;
