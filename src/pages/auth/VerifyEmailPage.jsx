import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Loader2, ArrowRight } from 'lucide-react';
import api from '@/api/client';
import { AUTH_CSS } from './_authStyles';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status,  setStatus]  = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Verification link is missing a token.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, []);

  return (
    <div className="auth-page">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid"/>

      <div className="auth-card" style={{ textAlign:'center', maxWidth:'400px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={22} color="#060200"/>
          </div>
          <div className="auth-logo-name">Addis Bright Academy</div>
        </div>

        {status === 'loading' && (
          <>
            <div className="auth-status-icon" style={{ background:'rgba(232,168,56,0.08)', margin:'0 auto 16px' }}>
              <Loader2 size={26} color="var(--amber)" className="auth-spin"/>
            </div>
            <h2 className="auth-h">Verifying your email</h2>
            <p className="auth-sub">Just a moment…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-status-icon" style={{ background:'rgba(52,211,153,0.08)', margin:'0 auto 16px' }}>
              <span style={{ fontSize:'1.8rem' }}>✅</span>
            </div>
            <h2 className="auth-h">Email <em>verified!</em></h2>
            <p className="auth-sub">Your account is now active. You can sign in and get started.</p>
            <Link to="/login" className="auth-btn" style={{ textDecoration:'none', display:'inline-flex', maxWidth:'260px', margin:'8px auto 0' }}>
              Go to login <ArrowRight size={15}/>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-status-icon" style={{ background:'rgba(248,113,113,0.08)', margin:'0 auto 16px' }}>
              <span style={{ fontSize:'1.8rem' }}>❌</span>
            </div>
            <h2 className="auth-h">Verification <em style={{ color:'#f87171' }}>failed</em></h2>
            <p className="auth-sub">{message}</p>
            <Link to="/login" className="auth-btn" style={{ textDecoration:'none', display:'inline-flex', maxWidth:'260px', margin:'8px auto 0' }}>
              Back to login <ArrowRight size={15}/>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
