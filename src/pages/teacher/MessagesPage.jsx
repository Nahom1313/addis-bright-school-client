import MessagesPage from '@/pages/messages/MessagesPage';
import AppShell from '@/components/shared/AppShell';
import { TEACHER_NAV } from './nav';

export default function TeacherMessagesPage() {
  return <MessagesPage navItems={TEACHER_NAV} AppShell={AppShell} />;
}
