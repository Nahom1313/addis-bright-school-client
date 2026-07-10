import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/api/client';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { AUTH_CSS } from './_authStyles';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>

      <div style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div className="auth-lang"><LanguageSwitcher /></div>

        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <GraduationCap size={22} color="#060200"/>
            </div>
            <div className="auth-logo-name">{t('auth.school_name')}</div>
          </div>

          {sent ? (
            <>
              <div className="auth-success">
                <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>📬</div>
                <h3>Check your inbox</h3>
                <p>We sent a password reset link to <strong style={{ color:'var(--amber)' }}>{email}</strong>. Follow the link to reset your password.</p>
                <Link to="/login" className="auth-btn" style={{ display:'inline-flex', textDecoration:'none', marginTop:'4px' }}>
                  Back to login <ArrowRight size={14}/>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="auth-h">Reset your <em>password</em></h1>
              <p className="auth-sub">Enter your email and we'll send you a reset link</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label className="auth-label">{t('auth.email')}</label>
                  <input
                    type="email" required autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="you@school.edu.et"
                  />
                </div>
                <button type="submit" disabled={loading} className="auth-btn">
                  {loading
                    ? <><Loader2 size={15} className="auth-spin"/>{t('auth.sending')}</>
                    : <>{t('auth.send_reset_link')}<ArrowRight size={15}/></>
                  }
                </button>
              </form>

              <div style={{ textAlign:'center', marginTop:'18px' }}>
                <Link to="/login" className="auth-back">
                  <ArrowLeft size={13}/> {t('auth.back_to_login')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
