import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/hooks/useAuth';
import { AUTH_CSS } from './_authStyles';

export default function LoginPage() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');

  const set = field => e => { setError(''); setForm(f => ({ ...f, [field]: e.target.value })); };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError(t('errors.something_wrong')); return; }
    login(form, {
      onError: err => setError(err.response?.data?.message || t('errors.something_wrong')),
    });
  };

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>

      <div style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center' }}>
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

          <p className="auth-footer">
            {t('auth.no_account')}{' '}
            <Link to="/register">{t('auth.create_account')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
