import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Hash, Shield, Copy, Check } from 'lucide-react';
import { useMe } from '@/hooks/useAuth';

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-stone-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-stone-500" />
    </div>
    <div>
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-stone-800">{value || '—'}</p>
    </div>
  </div>
);

const ROLE_BADGE = {
  director: 'badge-purple', teacher: 'badge-blue',
  parent: 'badge-green', student: 'badge-amber',
};

const ProfileCard = () => {
  const { data: me, isLoading } = useMe();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!me?.studentCode) return;
    navigator.clipboard.writeText(me.studentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="card space-y-4">
      <div className="h-16 bg-stone-100 rounded-xl animate-pulse" />
      <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
      <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-700 to-stone-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {me?.firstName?.[0]}{me?.lastName?.[0]}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-900 font-display">{me?.firstName} {me?.lastName}</h2>
          <span className={ROLE_BADGE[me?.role] || 'badge-stone'}>{me?.role}</span>
        </div>
      </div>

      {/* Student code — shown prominently for students */}
      {me?.role === 'student' && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-700 font-medium mb-1.5 flex items-center gap-1">
            <Hash className="w-3 h-3" /> Student Code
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-bold font-mono text-amber-800 tracking-wider">
              {me?.studentCode || 'Not assigned yet'}
            </span>
            {me?.studentCode && (
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium transition-colors"
              >
                {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            )}
          </div>
          <p className="text-xs text-amber-600 mt-1.5">Share this code with your parent so they can link your account.</p>
        </div>
      )}

      <ProfileField icon={Mail}   label="Email address" value={me?.email} />
      <ProfileField icon={Phone}  label="Phone"          value={me?.phone} />
      <ProfileField icon={Shield} label="Account status" value={me?.isActive ? 'Active' : 'Inactive'} />
      <ProfileField icon={User}   label="Member since"   value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : null} />
    </motion.div>
  );
};

export default ProfileCard;
