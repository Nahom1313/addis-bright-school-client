import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const set = (field) => (e) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)                    errs.currentPassword = 'Current password is required';
    if (!form.newPassword)                        errs.newPassword     = 'New password is required';
    else if (form.newPassword.length < 8)         errs.newPassword     = 'Must be at least 8 characters';
    if (form.newPassword === form.currentPassword) errs.newPassword    = 'New password must differ from current password';
    if (form.newPassword !== form.confirm)         errs.confirm        = 'Passwords do not match';
    return errs;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.patch('/auth/change-password', {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }),
    onSuccess: () => {
      setDone(true);
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update password.';
      if (msg.toLowerCase().includes('incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutate();
  };

  const Field = ({ label, field, autoComplete }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          className={`input pr-10 ${errors[field] ? 'border-red-300' : ''}`}
          autoComplete={autoComplete}
          placeholder="••••••••"
        />
        <button type="button" tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900">Change Password</h2>
            <p className="text-xs text-stone-400">{user?.email}</p>
          </div>
        </div>

        {done && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Password updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Current Password"     field="currentPassword" autoComplete="current-password" />
          <Field label="New Password"         field="newPassword"     autoComplete="new-password" />
          <Field label="Confirm New Password" field="confirm"         autoComplete="new-password" />
          <button type="submit" disabled={isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
