import { useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Copy, CheckCheck, Building2 } from 'lucide-react';
import { useState } from 'react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useSchoolInfo } from '@/hooks/useSchool';
import { useMe } from '@/hooks/useAuth';
import { PARENT_NAV } from './nav';
import toast from 'react-hot-toast';
import PrintExportButton from '@/components/shared/PrintExportButton';
import FeeReceiptDocument from '@/components/shared/FeeReceiptDocument';

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true); toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const Icon = copied ? CheckCheck : Copy;
  return (
    <button onClick={copy} className={`btn-icon ${copied ? 'text-emerald-600':'text-stone-400'}`}>
      <Icon className="w-3.5 h-3.5"/>
    </button>
  );
};

const BankCard = ({ account, i }) => (
  <motion.div
    className="card border border-stone-100"
    initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.08 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
        <CreditCard className="w-5 h-5 text-amber-700"/>
      </div>
      <div>
        <p className="font-semibold text-stone-800">{account.bankName}</p>
        {account.branch && <p className="text-xs text-stone-400">{account.branch}</p>}
      </div>
    </div>
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs text-stone-400 mb-0.5">Account name</p>
        <p className="font-medium text-stone-700">{account.accountName}</p>
      </div>
      <div>
        <p className="text-xs text-stone-400 mb-0.5">Account number</p>
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
          <span className="font-mono font-semibold text-stone-800 flex-1 tracking-wide">{account.accountNumber}</span>
          <CopyButton value={account.accountNumber}/>
        </div>
      </div>
      {account.notes && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">{account.notes}</p>
      )}
    </div>
  </motion.div>
);

const PaymentPage = () => {
  const { data: info, isLoading } = useSchoolInfo();
  const { data: me }              = useMe();
  const printRef                  = useRef(null);

  // Get child student info from parent's studentIds
  const student = me?.studentIds?.[0] || me;

  return (
    <AppShell navItems={PARENT_NAV}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Information</h1>
          <p className="page-subtitle">Bank accounts for manual tuition transfers</p>
        </div>
        <PrintExportButton
          printRef={printRef}
          filename="fee-receipt"
          label="Download Receipt"
        />
      </div>

      {info?.tuitionAmount && (
        <motion.div className="card mb-6 bg-amber-50 border-amber-100" initial={{ opacity:0 }} animate={{ opacity:1 }}>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-700 flex-shrink-0"/>
            <div>
              <p className="text-sm text-stone-600">Current tuition amount</p>
              <p className="text-2xl font-bold text-stone-900 font-display">
                {info.tuitionAmount.toLocaleString()}{' '}
                <span className="text-base font-normal text-stone-500">{info.currency}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="card-sm border border-stone-100 mb-6 bg-stone-50">
        <p className="text-sm text-stone-600 leading-relaxed">
          Please transfer tuition to one of the accounts below and keep your receipt. After transferring, notify the school office with your child's name and student code.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-44 bg-stone-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(info?.bankAccounts || []).map((account, i) => <BankCard key={i} account={account} i={i}/>)}
          {!info?.bankAccounts?.length && (
            <div className="card text-center py-12 col-span-2 text-stone-400">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              <p className="text-sm">Payment information not yet configured</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden printable receipt */}
      <div style={{ position:'absolute', left:'-9999px', top:0, pointerEvents:'none' }}>
        <FeeReceiptDocument
          ref={printRef}
          student={student}
          schoolInfo={info}
        />
      </div>
    </AppShell>
  );
};

export default PaymentPage;
