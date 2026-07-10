// Shared CSS injected into every auth page
export const AUTH_CSS = `
/* Reset global styles for landing page only */
.lp body,
.lp { background: #060606 !important; }

.lp h1,
.lp h2,
.lp h3 {
  font-family: 'Syne', sans-serif !important;
}
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bg:      #060606;
    --surface: #0f0f0f;
    --s2:      #161616;
    --border:  rgba(255,255,255,0.07);
    --b2:      rgba(255,255,255,0.11);
    --text:    #f0ece4;
    --muted:   rgba(240,236,228,0.42);
    --amber:   #e8a838;
    --amber2:  #c8742a;
    --fh:      'Syne', sans-serif;
    --fb:      'DM Sans', sans-serif;
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { -webkit-font-smoothing:antialiased; }

  .auth-page {
    min-height:100vh;
    background:var(--bg);
    display:flex; align-items:center; justify-content:center;
    padding:24px 20px;
    font-family:var(--fb);
    position:relative; overflow:hidden;
  }

  /* background glow orbs */
  .auth-page::before {
    content:'';
    position:fixed; top:-20%; left:-10%;
    width:600px; height:600px; border-radius:50%;
    background:radial-gradient(circle, rgba(232,168,56,0.07) 0%, transparent 70%);
    filter:blur(60px); pointer-events:none; z-index:0;
  }
  .auth-page::after {
    content:'';
    position:fixed; bottom:-20%; right:-10%;
    width:500px; height:500px; border-radius:50%;
    background:radial-gradient(circle, rgba(200,116,42,0.06) 0%, transparent 70%);
    filter:blur(60px); pointer-events:none; z-index:0;
  }

  /* subtle grid */
  .auth-grid {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
    background-size:72px 72px;
  }

  /* card */
  .auth-card {
    position:relative; z-index:1;
    width:100%; max-width:420px;
    background:rgba(15,15,15,0.85);
    backdrop-filter:blur(24px);
    border:1px solid var(--border);
    border-radius:24px;
    padding:36px 32px;
    box-shadow:0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  }

  /* top amber line accent */
  .auth-card::before {
    content:'';
    position:absolute; top:0; left:20%; right:20%; height:1px;
    background:linear-gradient(90deg, transparent, rgba(232,168,56,0.4), transparent);
    border-radius:100px;
  }

  /* logo */
  .auth-logo {
    display:flex; flex-direction:column; align-items:center; margin-bottom:28px;
  }
  .auth-logo-icon {
    width:48px; height:48px; border-radius:14px; margin-bottom:12px;
    background:linear-gradient(135deg,var(--amber),var(--amber2));
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 28px rgba(232,168,56,0.3);
  }
  .auth-logo-name {
    font-family:var(--fh); font-size:17px; font-weight:700;
    color:var(--text); letter-spacing:-0.01em;
  }
  .auth-logo-sub {
    font-size:12.5px; color:var(--muted); margin-top:3px;
  }

  /* headings */
  .auth-h {
    font-family:var(--fh); font-size:22px; font-weight:800;
    color:var(--text); letter-spacing:-0.03em;
    margin-bottom:6px; text-align:center;
  }
  .auth-h em { font-style:normal; color:var(--amber); }
  .auth-sub {
    font-size:13px; color:var(--muted); text-align:center;
    margin-bottom:28px; line-height:1.6;
  }

  /* label */
  .auth-label {
    display:block; font-size:12px; font-weight:600;
    color:rgba(240,236,228,0.55); margin-bottom:6px;
    letter-spacing:0.03em; text-transform:uppercase;
  }

  /* input */
  .auth-input {
    width:100%; background:rgba(255,255,255,0.04);
    border:1px solid var(--border); border-radius:12px;
    padding:11px 14px; font-size:14px; color:var(--text);
    font-family:var(--fb); outline:none;
    transition:border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance:none;
  }
  .auth-input::placeholder { color:rgba(240,236,228,0.2); }
  .auth-input:focus {
    border-color:rgba(232,168,56,0.5);
    box-shadow:0 0 0 3px rgba(232,168,56,0.08);
  }
  .auth-input.err { border-color:rgba(248,113,113,0.5); }
  .auth-input.err:focus { box-shadow:0 0 0 3px rgba(248,113,113,0.08); }

  /* select */
  .auth-select {
    width:100%; background:rgba(255,255,255,0.04);
    border:1px solid var(--border); border-radius:12px;
    padding:11px 14px; font-size:14px; color:var(--text);
    font-family:var(--fb); outline:none;
    transition:border-color 0.2s; cursor:pointer;
    -webkit-appearance:none; appearance:none;
  }
  .auth-select:focus { border-color:rgba(232,168,56,0.5); box-shadow:0 0 0 3px rgba(232,168,56,0.08); }
  .auth-select option { background:#111; color:var(--text); }

  /* input group (for password eye) */
  .auth-input-wrap { position:relative; }
  .auth-input-wrap .auth-input { padding-right:42px; }
  .auth-eye {
    position:absolute; right:13px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    color:rgba(240,236,228,0.3); transition:color 0.2s; padding:2px;
  }
  .auth-eye:hover { color:rgba(240,236,228,0.7); }

  /* field wrapper */
  .auth-field { margin-bottom:16px; }
  .auth-err-text { font-size:11.5px; color:#f87171; margin-top:5px; }

  /* button */
  .auth-btn {
    width:100%; padding:13px;
    background:linear-gradient(135deg,var(--amber),var(--amber2));
    color:#060200; font-family:var(--fb); font-size:14px; font-weight:700;
    border:none; border-radius:12px; cursor:pointer;
    transition:opacity 0.2s, transform 0.2s, box-shadow 0.2s;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 0 28px rgba(232,168,56,0.2);
    margin-top:8px;
  }
  .auth-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 0 40px rgba(232,168,56,0.35); }
  .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* error banner */
  .auth-error {
    background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2);
    border-radius:12px; padding:11px 14px; margin-bottom:18px;
    font-size:13px; color:#fca5a5;
  }

  /* success banner */
  .auth-success {
    background:rgba(52,211,153,0.07); border:1px solid rgba(52,211,153,0.2);
    border-radius:12px; padding:20px; text-align:center;
  }
  .auth-success-icon { font-size:2rem; margin-bottom:8px; }
  .auth-success h3 { font-family:var(--fh); font-size:16px; font-weight:700; color:var(--text); margin-bottom:6px; }
  .auth-success p { font-size:13px; color:var(--muted); line-height:1.65; margin-bottom:16px; }

  /* bottom link */
  .auth-footer {
    text-align:center; margin-top:22px;
    font-size:13px; color:var(--muted);
  }
  .auth-footer a, .auth-link {
    color:var(--amber); font-weight:600; text-decoration:none;
    transition:opacity 0.2s; background:none; border:none; cursor:pointer;
    font-size:inherit; font-family:inherit;
  }
  .auth-footer a:hover, .auth-link:hover { opacity:0.75; }

  /* back link */
  .auth-back {
    display:inline-flex; align-items:center; gap:5px;
    font-size:12.5px; color:var(--muted); text-decoration:none;
    transition:color 0.2s; margin-top:16px;
    background:none; border:none; cursor:pointer; font-family:var(--fb);
  }
  .auth-back:hover { color:var(--amber); }

  /* divider */
  .auth-divider {
    display:flex; align-items:center; gap:10px; margin:6px 0 18px;
  }
  .auth-divider::before, .auth-divider::after {
    content:''; flex:1; height:1px; background:var(--border);
  }
  .auth-divider span { font-size:11px; color:var(--muted); }

  /* lang switcher wrapper - inside card top right */
  .auth-lang {
    position:absolute; top:16px; right:16px; z-index:2;
  }
  .auth-lang > * {
    background:rgba(255,255,255,0.05) !important;
    border:1px solid var(--border) !important;
    border-radius:8px !important;
    padding:4px 10px !important;
    font-size:12px !important;
  }

  /* spinner */
  @keyframes auth-spin { to { transform:rotate(360deg); } }
  .auth-spin { animation:auth-spin 0.7s linear infinite; }

  /* grid cols for 2-col fields */
  .auth-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  /* status icons */
  .auth-status-icon {
    width:60px; height:60px; border-radius:50%; margin:0 auto 16px;
    display:flex; align-items:center; justify-content:center;
  }
`;
