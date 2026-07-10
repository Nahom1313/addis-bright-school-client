import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { AUTH_CSS } from './_authStyles';

const ROLE_ROUTES = { teacher: '/teacher', parent: '/parent', student: '/student' };

// Defined outside component to prevent focus loss on re-render
const Field = ({ name, label, type = 'text', placeholder, errors, form, onChange, children }) => (
  <div className="auth-field">
    <label className="auth-label">{label}</label>
    {children || (
      <input
        type={type}
        className={`auth-input${errors[name] ? ' err' : ''}`}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'off'}
      />
    )}
    {errors[name] && <p className="auth-err-text">{errors[name]}</p>}
  </div>
);

export default function RegisterPage() {
  const { t }     = useTranslation();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm]     = useState({ firstName: '', lastName: '', email: '', password: '', role: 'student' });

  const handleChange = field => e => {
    setErrors(p => ({ ...p, [field]: '', general: '' }));
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)         e.password  = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const { mutate: register, isPending } = useMutation({
    mutationFn: data => api.post('/auth/register', data),
    onSuccess: ({ data }) => {
      const { user, token } = data.data;
      login(user, token);
      navigate(ROLE_ROUTES[user.role] || '/');
    },
    onError: err => {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        const mapped = {};
        serverErrors.forEach(e => { mapped[e.field] = e.message; });
        setErrors(mapped);
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' });
      }
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    register(form);
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

          <h1 className="auth-h">Create your <em>account</em></h1>
          <p className="auth-sub">Join Addis Bright Academy's platform</p>

          {errors.general && <div className="auth-error">{errors.general}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-grid-2">
              <Field name="firstName" label={t('auth.first_name')} placeholder="Abebe"
                errors={errors} form={form} onChange={handleChange('firstName')}/>
              <Field name="lastName" label={t('auth.last_name')} placeholder="Kebede"
                errors={errors} form={form} onChange={handleChange('lastName')}/>
            </div>

            <Field name="email" label={t('auth.email')} type="email" placeholder="you@school.edu.et"
              errors={errors} form={form} onChange={handleChange('email')}/>

            <div className="auth-field">
              <label className="auth-label">{t('auth.password')}</label>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`auth-input${errors.password ? ' err' : ''}`}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p className="auth-err-text">{errors.password}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">{t('auth.i_am_a')}</label>
              <div style={{ position:'relative' }}>
                <select className="auth-select" value={form.role} onChange={handleChange('role')}>
                  <option value="student">{t('roles.student')}</option>
                  <option value="parent">{t('roles.parent')}</option>
                  <option value="teacher">{t('roles.teacher')}</option>
                </select>
                <div style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--muted)' }}>
                  ▾
                </div>
              </div>
            </div>

            <button type="submit" disabled={isPending} className="auth-btn">
              {isPending
                ? <><Loader2 size={15} className="auth-spin"/>{t('auth.creating_account')}</>
                : <>{t('auth.create_account')}<ArrowRight size={15}/></>
              }
            </button>
          </form>

          <p className="auth-footer">
            {t('auth.have_account')}{' '}
            <Link to="/login">{t('auth.sign_in')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
