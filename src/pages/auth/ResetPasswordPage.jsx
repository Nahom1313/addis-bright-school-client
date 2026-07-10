import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { AUTH_CSS } from './_authStyles';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm]       = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      toast.success(t('auth.reset_success'));
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>
      <div className="auth-card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>⚠️</div>
        <h2 className="auth-h">Invalid link</h2>
        <p className="auth-sub">This reset link is invalid or has expired.</p>
        <Link to="/login" className="auth-btn" style={{ display:'inline-flex', textDecoration:'none' }}>
          Back to login <ArrowRight size={14}/>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>

      <div style={{ width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <GraduationCap size={22} color="#060200"/>
            </div>
            <div className="auth-logo-name">{t('auth.school_name')}</div>
          </div>

          <h1 className="auth-h">Set a new <em>password</em></h1>
          <p className="auth-sub">Choose a strong password for your account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">{t('auth.new_password')}</label>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? 'text' : 'password'} required minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="auth-input"
                  placeholder="Min. 8 characters"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">{t('auth.confirm_password')}</label>
              <div className="auth-input-wrap">
                <input
                  type={showCp ? 'text' : 'password'} required
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="auth-input"
                  placeholder="••••••••"
                />
                <button type="button" className="auth-eye" onClick={() => setShowCp(v => !v)} tabIndex={-1}>
                  {showCp ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading
                ? <><Loader2 size={15} className="auth-spin"/>Resetting…</>
                : <>{t('auth.reset_password')}<ArrowRight size={15}/></>
              }
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'18px' }}>
            <Link to="/login" className="auth-back">
              <ArrowLeft size={13}/> {t('auth.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
