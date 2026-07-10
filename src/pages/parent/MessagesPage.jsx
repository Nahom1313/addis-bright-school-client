import MessagesPage from '@/pages/messages/MessagesPage';
import AppShell from '@/components/shared/AppShell';
import { PARENT_NAV } from './nav';

export default function ParentMessagesPage() {
  return <MessagesPage navItems={PARENT_NAV} AppShell={AppShell} />;
}
