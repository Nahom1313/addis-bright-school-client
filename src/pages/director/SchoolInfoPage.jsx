import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Trash2, CreditCard, Pencil } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import { useSchoolInfo, useUpdateSchoolInfo, useAddBankAccount, useRemoveBankAccount } from '@/hooks/useSchool';
import { DIRECTOR_NAV } from './nav';

const BankCard = ({ account, index, onRemove }) => (
  <motion.div className="card-sm border border-stone-100 flex items-start gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
      <CreditCard className="w-5 h-5 text-amber-700" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-stone-800 text-sm">{account.bankName}</p>
      <p className="text-xs text-stone-500 mt-0.5">{account.accountName}</p>
      <p className="text-sm font-mono text-stone-700 mt-1 bg-stone-50 rounded-lg px-2 py-1 inline-block">{account.accountNumber}</p>
      {account.branch && <p className="text-xs text-stone-400 mt-1">{account.branch}</p>}
      {account.notes  && <p className="text-xs text-amber-700 mt-1">{account.notes}</p>}
    </div>
    <button onClick={() => onRemove(index)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
);

const SchoolInfoPage = () => {
  const { data: info, isLoading } = useSchoolInfo();
  const updateInfo   = useUpdateSchoolInfo();
  const addBank      = useAddBankAccount();
  const removeBank   = useRemoveBankAccount();

  const [editing, setEditing]   = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [form, setForm] = useState({ schoolName:'', address:'', phone:'', email:'', currentAcademicYear:'' });
  const [bf, setBf]     = useState({ bankName:'', accountName:'', accountNumber:'', branch:'', notes:'' });

  useEffect(() => {
    if (info) setForm({ schoolName: info.schoolName||'', address: info.address||'', phone: info.phone||'', email: info.email||'', currentAcademicYear: info.currentAcademicYear||'' });
  }, [info]);

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setB = k => e => setBf(p => ({ ...p, [k]: e.target.value }));

  const saveInfo = e => {
    e.preventDefault();
    updateInfo.mutate(form, { onSuccess: () => setEditing(false) });
  };

  const saveBank = e => {
    e.preventDefault();
    addBank.mutate(bf, { onSuccess: () => { setBankModal(false); setBf({ bankName:'', accountName:'', accountNumber:'', branch:'', notes:'' }); } });
  };

  if (isLoading) return <AppShell navItems={DIRECTOR_NAV}><div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse"/>)}</div></AppShell>;

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader title="School Settings" subtitle="Manage school information and payment details" />

      {/* School info card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">School Information</p>
              <p className="text-xs text-stone-400">Basic details and contact info</p>
            </div>
          </div>
          {!editing && (
            <button className="btn-secondary flex items-center gap-2" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">School name</label><input className="input" value={form.schoolName} onChange={set('schoolName')} /></div>
              <div><label className="label">Academic year</label><input className="input" value={form.currentAcademicYear} onChange={set('currentAcademicYear')} placeholder="2024/2025" /></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
            </div>
            <div><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={set('address')} /></div>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={updateInfo.isPending}>{updateInfo.isPending ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            {[['School name', info?.schoolName], ['Academic year', info?.currentAcademicYear], ['Phone', info?.phone], ['Email', info?.email], ['Address', info?.address], ['Tuition', info?.tuitionAmount ? `${info.tuitionAmount} ${info.currency}` : '—']].map(([l,v]) => (
              <div key={l}><p className="text-xs text-stone-400 mb-0.5">{l}</p><p className="font-medium text-stone-800">{v || '—'}</p></div>
            ))}
          </div>
        )}
      </div>

      {/* Bank accounts */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-stone-800">Bank Accounts</p>
          <p className="text-xs text-stone-400">Displayed to parents for tuition transfers</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setBankModal(true)}>
          <Plus className="w-4 h-4" /> Add account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(info?.bankAccounts || []).map((account, i) => (
          <BankCard key={i} account={account} index={i} onRemove={idx => removeBank.mutate(idx)} />
        ))}
        {!info?.bankAccounts?.length && (
          <div className="card text-center py-10 text-stone-400 col-span-2">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No bank accounts added yet</p>
          </div>
        )}
      </div>

      <Modal open={bankModal} onClose={() => setBankModal(false)} title="Add Bank Account" size="sm">
        <form onSubmit={saveBank} className="space-y-4">
          <div><label className="label">Bank name (e.g. CBE, Telebirr)</label><input className="input" value={bf.bankName} onChange={setB('bankName')} required /></div>
          <div><label className="label">Account name</label><input className="input" value={bf.accountName} onChange={setB('accountName')} required /></div>
          <div><label className="label">Account number</label><input className="input font-mono" value={bf.accountNumber} onChange={setB('accountNumber')} required /></div>
          <div><label className="label">Branch (optional)</label><input className="input" value={bf.branch} onChange={setB('branch')} /></div>
          <div><label className="label">Notes (optional)</label><input className="input" value={bf.notes} onChange={setB('notes')} placeholder="e.g. For tuition payments only" /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setBankModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={addBank.isPending}>{addBank.isPending ? 'Adding…' : 'Add account'}</button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};

export default SchoolInfoPage;
