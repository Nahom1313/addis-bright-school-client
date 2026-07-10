import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import ProfileCard from '@/components/shared/ProfileCard';
import { STUDENT_NAV } from './nav';

const StudentProfile = () => (
  <AppShell navItems={STUDENT_NAV}>
    <PageHeader title="My Profile" subtitle="Your student account details" />
    <div className="max-w-lg"><ProfileCard /></div>
  </AppShell>
);
export default StudentProfile;
