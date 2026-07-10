import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Search, ArrowLeft,
  Loader2, User, Check, CheckCheck, Trash2, Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { messagesApi } from '@/api/messages';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import clsx from 'clsx';

// ─── Helpers ──────────────────────────────────────────────────────
const getAvatar = (user) => {
  if (!user?.profilePicture) return null;
  const pic = user.profilePicture;
  return pic.startsWith('http') ? pic : `/uploads/profiles/${pic}`;
};

const getInitials = (user) =>
  user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : '?';

const formatMsgTime = (date) => {
  const d = new Date(date);
  if (isToday(d))     return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

const ROLE_COLOR = { parent: 'bg-emerald-100 text-emerald-700', teacher: 'bg-violet-100 text-violet-700' };

// ─── Avatar ───────────────────────────────────────────────────────
const Avatar = ({ user, size = 10 }) => {
  const pic = getAvatar(user);
  const dim = `w-${size} h-${size}`;
  const role = user?.role || 'parent';
  return (
    <div className={clsx(dim, 'rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm overflow-hidden', ROLE_COLOR[role] || 'bg-stone-100 text-stone-600')}>
      {pic ? <img src={pic} alt="" className="w-full h-full object-cover" /> : getInitials(user)}
    </div>
  );
};

// ─── New Conversation Modal ───────────────────────────────────────
const NewConversationModal = ({ open, onClose, onCreated, myRole }) => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { user } = useAuth();

  const targetRole = myRole === 'parent' ? 'teacher' : 'parent';

  const { data: users = [] } = useQuery({
    queryKey: ['msg-search', targetRole, search],
    queryFn: () => api.get(`/users?role=${targetRole}&limit=20`, { params: { search } }).then(r => r.data.data?.users || []),
    enabled: search.length > 0,
  });

  const { data: myStudents = [] } = useQuery({
    queryKey: ['my-students', user?._id],
    queryFn: async () => {
      if (myRole !== 'parent') return [];
      const me = await api.get('/auth/me').then(r => r.data.data);
      return me?.studentIds || [];
    },
    enabled: myRole === 'parent',
  });

  const createMutation = useMutation({
    mutationFn: () => messagesApi.startConversation({
      teacherId: myRole === 'parent' ? selectedUser._id : selectedUser._id,
      studentId: selectedStudent?._id || selectedStudent || undefined,
    }),
    onSuccess: ({ data }) => { onCreated(data.data.conversation); onClose(); setSelectedUser(null); setSearch(''); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to start conversation.'),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <h3 className="font-bold text-stone-900 mb-4">New Conversation</h3>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input className="input pl-10" placeholder={`Search ${targetRole}s…`}
            value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>

        <div className="space-y-1 max-h-52 overflow-y-auto mb-4">
          {users.map(u => (
            <button key={u._id} onClick={() => setSelectedUser(u)}
              className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                selectedUser?._id === u._id ? 'bg-amber-50 border border-amber-200' : 'hover:bg-stone-50')}>
              <Avatar user={u} size={8} />
              <div>
                <p className="font-medium text-sm text-stone-800">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-stone-400 capitalize">{u.role}</p>
              </div>
              {selectedUser?._id === u._id && <Check className="w-4 h-4 text-amber-600 ml-auto" />}
            </button>
          ))}
        </div>

        {myRole === 'parent' && myStudents.length > 0 && (
          <div className="mb-4">
            <label className="label">Regarding student (optional)</label>
            <select className="input" value={selectedStudent || ''} onChange={e => setSelectedStudent(e.target.value || null)}>
              <option value="">No specific student</option>
              {myStudents.map(s => {
                const id = s._id || s;
                const name = s.firstName ? `${s.firstName} ${s.lastName}` : id;
                return <option key={id} value={id}>{name}</option>;
              })}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" disabled={!selectedUser || createMutation.isPending}
            onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Start chat'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Conversation List ────────────────────────────────────────────
const ConversationList = ({ conversations, selected, onSelect, myId, onNew }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
      <div>
        <h2 className="font-bold text-stone-900">Messages</h2>
        <p className="text-xs text-stone-400">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      <button onClick={onNew} className="btn-icon bg-amber-50 text-amber-700 hover:bg-amber-100">
        <Plus className="w-4 h-4" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-8 h-8 text-stone-200 mx-auto mb-2" />
          <p className="text-sm text-stone-400">No conversations yet</p>
          <button onClick={onNew} className="text-amber-600 text-xs font-medium mt-2 hover:underline">
            Start one
          </button>
        </div>
      ) : (
        conversations.map(conv => {
          const other = conv.participants?.find(p => String(p._id) !== myId);
          const unread = conv.myUnread || 0;
          const isSelected = selected?._id === conv._id;
          return (
            <button key={conv._id} onClick={() => onSelect(conv)}
              className={clsx('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-stone-50',
                isSelected ? 'bg-amber-50' : 'hover:bg-stone-50')}>
              <Avatar user={other} size={10} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-stone-900 truncate">{other?.firstName} {other?.lastName}</p>
                  {conv.lastMessageAt && <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">{formatMsgTime(conv.lastMessageAt)}</span>}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-stone-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                  {unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                {conv.studentId && (
                  <p className="text-[10px] text-amber-600 mt-0.5">Re: {conv.studentId.firstName} {conv.studentId.lastName}</p>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────
const MessageBubble = ({ message, isMe, onDelete }) => {
  const isDeleted = message.deleted;

  return (
    <div className={clsx('flex gap-2 group', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {!isMe && <Avatar user={message.senderId} size={7} />}
      <div className={clsx('max-w-[72%] relative', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={clsx('px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isMe
            ? 'bg-amber-600 text-white rounded-br-md'
            : 'bg-stone-100 text-stone-800 rounded-bl-md',
          isDeleted && 'opacity-50 italic'
        )}>
          {message.body}
        </div>
        <div className={clsx('flex items-center gap-1.5 mt-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-stone-400">{format(new Date(message.createdAt), 'h:mm a')}</span>
          {isMe && !isDeleted && message.readBy?.length > 1 && (
            <CheckCheck className="w-3 h-3 text-amber-500" />
          )}
        </div>
        {isMe && !isDeleted && (
          <button onClick={() => onDelete(message._id)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 btn-icon text-red-400 opacity-40 hover:opacity-100 transition-opacity">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Chat View ────────────────────────────────────────────────────
const ChatView = ({ conversation, myId, onBack }) => {
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const other = conversation.participants?.find(p => String(p._id) !== myId);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversation._id],
    queryFn: () => messagesApi.getMessages(conversation._id).then(r => r.data.data),
    refetchInterval: false,
  });

  const messages = data?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: () => messagesApi.sendMessage(conversation._id, input.trim()),
    onSuccess: () => {
      setInput('');
      qc.invalidateQueries({ queryKey: ['messages', conversation._id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to send.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (msgId) => messagesApi.deleteMessage(conversation._id, msgId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', conversation._id] }),
    onError: () => toast.error('Failed to delete message.'),
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (input.trim()) sendMutation.mutate(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 flex-shrink-0">
        <button onClick={onBack} className="btn-icon md:hidden"><ArrowLeft className="w-4 h-4" /></button>
        <Avatar user={other} size={9} />
        <div>
          <p className="font-semibold text-stone-900 text-sm">{other?.firstName} {other?.lastName}</p>
          <p className="text-xs text-stone-400 capitalize">{other?.role}</p>
        </div>
        {conversation.studentId && (
          <span className="ml-auto text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
            Re: {conversation.studentId.firstName}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="text-sm text-stone-400">Send the first message</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <MessageBubble
                  message={msg}
                  isMe={String(msg.senderId?._id || msg.senderId) === myId}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-stone-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            className="input flex-1 resize-none py-2.5 max-h-24"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => { if (input.trim()) sendMutation.mutate(); }}
            disabled={!input.trim() || sendMutation.isPending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors disabled:opacity-40">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-stone-300 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
export default function MessagesPage({ navItems, AppShell }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then(r => r.data.data.conversations || []),
  });

  const conversations = data || [];

  // Listen for new messages in real time
  useEffect(() => {
    if (!socket) return;
    const handle = ({ conversationId, message }) => {
      qc.setQueryData(['messages', conversationId], (old) => {
        if (!old) return old;
        return { ...old, messages: [...(old.messages || []), message] };
      });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    };
    socket.on('new_message', handle);
    return () => socket.off('new_message', handle);
  }, [socket, qc]);

  const handleSelect = (conv) => {
    setSelected(conv);
    setMobileView('chat');
    qc.invalidateQueries({ queryKey: ['messages', conv._id] });
  };

  const handleNewConv = (conv) => {
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setSelected(conv);
    setMobileView('chat');
  };

  return (
    <AppShell navItems={navItems}>
      <div className="flex h-[calc(100vh-80px)] -mx-4 md:-mx-6 -my-6 overflow-hidden rounded-2xl border border-stone-100 bg-white">
        {/* Left: Conversation list */}
        <div className={clsx('w-full md:w-80 flex-shrink-0 border-r border-stone-100', mobileView === 'chat' && 'hidden md:block')}>
          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={handleSelect}
            myId={String(user?._id)}
            onNew={() => setNewModal(true)}
          />
        </div>

        {/* Right: Chat view */}
        <div className={clsx('flex-1 min-w-0', mobileView === 'list' && 'hidden md:flex md:flex-col')}>
          {selected ? (
            <ChatView
              conversation={selected}
              myId={String(user?._id)}
              onBack={() => { setSelected(null); setMobileView('list'); }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                <p className="font-medium text-stone-500">Select a conversation</p>
                <p className="text-sm text-stone-400 mt-1">or start a new one</p>
                <button onClick={() => setNewModal(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> New conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewConversationModal
        open={newModal}
        onClose={() => setNewModal(false)}
        onCreated={handleNewConv}
        myRole={user?.role}
      />
    </AppShell>
  );
}
