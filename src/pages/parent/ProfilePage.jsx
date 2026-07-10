import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Link2, CheckCircle2, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useMe } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { PARENT_NAV } from './nav';
import clsx from 'clsx';

const ParentProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: me, refetch } = useMe();
  const qc = useQueryClient();

  const [code, setCode]     = useState('');
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const linkMutation = useMutation({
    mutationFn: (studentCode) => api.patch('/users/link-by-code', { studentCode }),
    onSuccess: ({ data }) => {
      const student = data.data.linkedStudent;
      setResult(student);
      setCode('');
      setError('');
      toast.success(`${student.firstName} ${student.lastName} linked!`);
      refetch();
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to link student.');
      setResult(null);
    },
  });

  const handleLink = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!code.trim()) { setError('Please enter a student code.'); return; }
    linkMutation.mutate(code.trim());
  };

  // Use already-populated me.studentIds directly — no extra fetch needed
  // me.studentIds contains { _id, firstName, lastName, studentCode, profilePicture }
  const children = (me?.studentIds || []).map(s =>
    typeof s === 'object' ? s : { _id: s }
  );

  return (
    <AppShell navItems={PARENT_NAV}>
      <PageHeader title="My Profile" subtitle="Your account and linked children" />

      <div className="max-w-lg space-y-6">

        {/* Account info */}
        <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-stone-400 text-sm">{user?.email}</p>
              <span className="badge bg-amber-50 text-amber-700 border-amber-100 text-xs mt-1">Parent</span>
            </div>
          </div>
        </motion.div>

        {/* Linked children */}
        <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-stone-400" />
            <p className="font-semibold text-stone-800">Linked Children</p>
            <span className="badge-stone text-xs ml-auto">{children.length} linked</span>
          </div>

          {children.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-4">
              No children linked yet. Use the form below to link your child.
            </p>
          ) : (
            <div className="space-y-2">
              {children.map(child => (
                <div key={child._id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-sky-700">
                      {child.firstName?.[0]}{child.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-stone-400 font-mono">{child.studentCode}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Link a child by Student ID */}
        <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-stone-400" />
            <p className="font-semibold text-stone-800">Link Your Child</p>
          </div>
          <p className="text-stone-500 text-sm mb-4 leading-relaxed">
            Ask your child's school director for their <strong>Student ID</strong> (format: STU-2024-001), then enter it below to link them to your account.
          </p>

          <form onSubmit={handleLink} className="space-y-3">
            <div>
              <label className="label">Student ID</label>
              <input
                type="text"
                className={clsx('input font-mono uppercase', error ? 'border-red-400' : '')}
                placeholder="STU-2024-001"
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); setResult(null); }}
                autoComplete="off"
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}
              {result && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-600 text-xs font-medium">
                    {result.firstName} {result.lastName} linked successfully!
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={linkMutation.isPending || !code.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {linkMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Linking…</>
                : <><Link2 className="w-4 h-4" />Link child</>
              }
            </button>
          </form>
        </motion.div>

      </div>
    </AppShell>
  );
};

export default ParentProfilePage;
