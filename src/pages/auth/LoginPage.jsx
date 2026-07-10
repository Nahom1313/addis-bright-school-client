import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { AUTH_CSS } from './_authStyles';

// ─── Test accounts — update emails/passwords to match your DB ─────
const TEST_ACCOUNTS = [
  { role: 'Director',   email: 'director@addisbright.com',  password: 'Director1',  color: '#7c3aed' },
  { role: 'Registrar',  email: 'registrar@addisbright.com', password: 'Registrar1', color: '#2563eb' },
  { role: 'Teacher',    email: 'teacher@addisbright.com',   password: 'Teacher1',   color: '#0891b2' },
  { role: 'Student',    email: 'student@addisbright.com',   password: 'Student1',   color: '#16a34a' },
  { role: 'Parent',     email: 'parent@addisbright.com',    password: 'Parent1',    color: '#d97706' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loadingRole, setLoadingRole] = useState(null);

  const set = field => e => { setError(''); setForm(f => ({ ...f, [field]: e.target.value })); };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError(t('errors.something_wrong')); return; }
    login(form, {
      onError: err => setError(err.response?.data?.message || t('errors.something_wrong')),
    });
  };

  const loginAs = (account) => {
    setError('');
    setLoadingRole(account.role);
    login({ email: account.email, password: account.password }, {
      onError: err => {
        setLoadingRole(null);
        setError(`${account.role}: ${err.response?.data?.message || 'Login failed'}`);
      },
      onSettled: () => setLoadingRole(null),
    });
  };

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>

      <div style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div className="auth-lang"><LanguageSwitcher /></div>

        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <GraduationCap size={22} color="#060200"/>
            </div>
            <div className="auth-logo-name">{t('auth.school_name')}</div>
            <div className="auth-logo-sub">{t('auth.welcome')}</div>
          </div>

          <h1 className="auth-h">Welcome <em>back</em></h1>
          <p className="auth-sub">Sign in to your account to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">{t('auth.email')}</label>
              <input
                type="email" required autoFocus
                value={form.email} onChange={set('email')}
                className="auth-input"
                placeholder="you@school.edu.et"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <label className="auth-label" style={{ margin:0 }}>{t('auth.password')}</label>
                <Link to="/forgot-password" style={{ fontSize:'12px', color:'var(--amber)', textDecoration:'none' }}>
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  className="auth-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isPending} className="auth-btn">
              {isPending
                ? <><Loader2 size={15} className="auth-spin"/>{t('auth.signing_in')}</>
                : <>{t('auth.sign_in')}<ArrowRight size={15}/></>
              }
            </button>
          </form>

          {/* ─── Test login shortcuts ─────────────────────────────── */}
          <div style={{ marginTop:'24px', borderTop:'1px solid #e7e5e4', paddingTop:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
              <FlaskConical size={13} color="#a8a29e" />
              <span style={{ fontSize:'11px', fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Quick test login
              </span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {TEST_ACCOUNTS.map(account => (
                <button
                  key={account.role}
                  onClick={() => loginAs(account)}
                  disabled={!!loadingRole}
                  style={{
                    padding:'6px 14px',
                    borderRadius:'10px',
                    border:`1.5px solid ${account.color}22`,
                    backgroundColor:`${account.color}10`,
                    color: account.color,
                    fontSize:'12px',
                    fontWeight:600,
                    cursor:'pointer',
                    opacity: loadingRole && loadingRole !== account.role ? 0.4 : 1,
                    display:'flex',
                    alignItems:'center',
                    gap:'5px',
                    transition:'all 0.15s',
                  }}>
                  {loadingRole === account.role
                    ? <Loader2 size={11} className="auth-spin" />
                    : null
                  }
                  {account.role}
                </button>
              ))}
            </div>
            <p style={{ fontSize:'10px', color:'#d4cfc9', marginTop:'10px' }}>
              Update emails in <code style={{ fontSize:'10px' }}>LoginPage.jsx</code> to match your test accounts
            </p>
          </div>

          <p className="auth-footer">
            {t('auth.no_account')}{' '}
            <Link to="/register">{t('auth.create_account')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

