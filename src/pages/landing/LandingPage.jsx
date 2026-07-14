import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Bell, CheckSquare, Video, Languages, Trophy,
  Users, ChevronRight, ArrowUpRight, Menu, X,
  GraduationCap, Star, Sparkles,
} from 'lucide-react';

import heroBg    from '@/assets/images/hero-bg.png';
import heroMain  from '@/assets/images/hero-main.png';
import heroSmall from '@/assets/images/hero-small.png';
import aboutImg  from '@/assets/images/about.png';

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const MagneticBtn = ({ children, className = '' }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 16;
    el.style.transform = `translate(${x}px,${y}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}
      style={{ display:'inline-block', transition:'transform 0.35s cubic-bezier(.25,.46,.45,.94)' }}>
      {children}
    </div>
  );
};

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const dur = 2000; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick); else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Reveal = ({ children, delay = 0, className = '', style = {} }) => {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : 'translateY(36px)',
      transition: `opacity 0.85s cubic-bezier(.25,.46,.45,.94) ${delay}s,
                   transform 0.85s cubic-bezier(.25,.46,.45,.94) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
};

// Pre-baked noise texture (tiny tiled PNG data-URI) instead of a live SVG
// feTurbulence filter — the live filter renders as heavy, glitchy static on
// many mobile GPUs/browsers. This version is static, cheap, and consistent
// across devices.
const NOISE_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAAEK0lEQVR42gEgBN/7AKU0J1XM9Q7N14TXjuQcLhn2j8nxvCXr/ai6gNczE7plAU0TQEXkLpicFyX9uT7QXIIWGo4NsETG2PuR6iPue/w2AMq+rs01n/FRTeW2XYrDLX34uievZ++hn14P/OQSBchAARgZgttoNVnTsj1dNtjfubGP7ULYetuX54zjcRXccyhHACUg/kbNSWNB4dUvJQl8zIcy/tuY03/zdhB+/ncC0Wj3BAvu65ZDFWdefOGMzvcWSexu+rH28bj5eCkwX+fxy5s5ALtpI45hr+RNAsgJCBIXyen6yRiF03J+ccEUBNV2Xt4bAB3+L9Qih7LuTOKtLQfrCyOUDI/Pa08Oh7/Am+vln1DGA18lBgj+fed2DQRD+sPkZdExAsT5Tsal6/5d99wReJ1dABOg8sLhUinySCXhKmFQmyHtARqaijedN+LteD4UaDpSACzuIXZTC3Cz8nsJcfOJd/Lu+5L3reoc/VYgp5aWEC5xBLL6/tfrXsTfip5JXgxnRwpt67o3cgzvYuH//ADh7dIAAvjRf912UED04krlZWcdJKVO6TN04OlYE8pkSPnG+uuVASN2S3bAMaUanMYrp/hQQcDfNO7NOXL/+TA7VtCQB8sHA2r14NgBzubQoeqHuU4J5uIwrHe4SOQ47hGnvGb2kHa7BLMuRuWzmBTQPwgZHfjLV8OMqsLUiDdS8w2NuMQCYw8cA8LiEeQSvPv53yIxcPTtexyizbknGaFl+3oJOeCynoHaAR4L4vstUnLnoTx6oMjgFFoduP8/MWzZVQ60xhRZkcuyAzBlmn8lHCf08LvsCduc+WIS9yuEO69/SsZGAG+M2STGAXKLuKiwSKB3IfQGuzMpeK0nU9HZmAE9sP2suq5nbnj5AB+vVoYktrAOFUaLFq9v2ycnqcyqxN90DMKGIV+Fyy23AMvlO5BqciuAMu8UemW2R/XmAGjmzDn8SLaiEX0Dir0/BE56wQa+6MvstYFIvg+nwZ72poP0GPkVw8rv5YIzR4YNAliSIkiMyokpJ8AuGoijbYQ9B/Bt+fKcRj8LsNZ9wPMyARclM2er4gMVpat3RCv6gDoGYAeQPfo+Rw7VUT7fLhWwAETWk72xevSm4vnYGRvDDydrPeZ8C2K5Xhkh2mAT1ZEVAZTA7mEXE44pIq0x2Obo6zbbPuLoE4UE/ykaKXIVXjjBA4waBrB1lXclqBZU0rPbwGLHvWz5wxq+T3g/zrxAO99wA97RZpa4DQiDOdO8RtEDT9LwbWUHesOYLDycWnaMQ5zZADz6yOk7/Cwf59z9nIJmNZuGgRku8gCVOeTzK4AW1DfHAmHdNt++up6WDfKqzVoZi6kyPSh1CAWN7377P/1SAY0iAr89KwP1WCM1it+GK3eDJ8KLYxbXBpVHLEPXx/kaNDezY4oMFQOXf+UAAAAASUVORK5CYII=";

const Noise = () => (
  <div aria-hidden="true" className="lp-noise" style={{
    position:'absolute',inset:0,width:'100%',height:'100%',
    opacity:0.05,pointerEvents:'none',zIndex:5,mixBlendMode:'overlay',
    backgroundImage:`url(${NOISE_DATA_URI})`,
    backgroundRepeat:'repeat',
  }}/>
);

const CSS = `
  .lp body, .lp { background: #060606 !important; }
  .lp h1, .lp h2, .lp h3 { font-family: 'Syne', sans-serif !important; }

  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bg:       #060606;
    --surface:  #0f0f0f;
    --surface2: #141414;
    --border:   rgba(255,255,255,0.065);
    --border2:  rgba(255,255,255,0.1);
    --text:     #f0ece4;
    --muted:    rgba(240,236,228,0.42);
    --amber:    #e8a838;
    --amber2:   #c8742a;
    --fh:       'Syne', sans-serif;
    --fb:       'DM Sans', sans-serif;
    --max:      1240px;
    --px:       clamp(20px, 5vw, 80px);
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }
  html, body { overflow-x:hidden; max-width:100vw; }

  .lp {
    background:var(--bg); color:var(--text);
    font-family:var(--fb); overflow-x:hidden;
    width:100%; max-width:100vw; min-width:320px;
  }

  .lp-wrap {
    width:100%; max-width:var(--max);
    margin-left:auto; margin-right:auto;
    padding-left:var(--px); padding-right:var(--px);
  }

  /* Navbar */
  .lp-nav {
    position:fixed; top:0; left:0; right:0; z-index:200;
    height:68px; display:flex; align-items:center; justify-content:space-between;
    padding:0 var(--px);
    transition:background 0.4s, backdrop-filter 0.4s, border-bottom 0.4s;
  }
  .lp-nav.sc {
    background:rgba(6,6,6,0.88);
    backdrop-filter:blur(24px) saturate(1.4);
    border-bottom:1px solid var(--border);
  }
  .lp-logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
  .lp-logo-icon {
    width:34px; height:34px; border-radius:9px; flex-shrink:0;
    background:linear-gradient(135deg,var(--amber),var(--amber2));
    display:flex; align-items:center; justify-content:center;
  }
  .lp-logo span { font-family:var(--fh); font-size:16px; font-weight:700; color:var(--text); letter-spacing:-0.01em; }
  .lp-nav-links {
    display:flex; align-items:center; gap:32px;
    position:absolute; left:50%; transform:translateX(-50%);
  }
  .lp-navbtn {
    background:none; border:none; cursor:pointer; font-family:var(--fb);
    font-size:13.5px; color:var(--muted); transition:color 0.2s; letter-spacing:0.01em;
  }
  .lp-navbtn:hover { color:var(--text); }
  .lp-nav-actions { display:flex; align-items:center; gap:10px; flex-shrink:0; }
  .lp-btn-ghost {
    background:none; border:1px solid var(--border2); color:var(--text);
    padding:8px 20px; border-radius:100px; font-size:13px; font-family:var(--fb);
    cursor:pointer; transition:border-color 0.2s; text-decoration:none; display:inline-block; white-space:nowrap;
  }
  .lp-btn-ghost:hover { border-color:rgba(255,255,255,0.28); }
  .lp-btn-amber {
    background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#060200;
    padding:8px 20px; border-radius:100px; font-size:13px; font-weight:700; font-family:var(--fb);
    cursor:pointer; border:none; text-decoration:none; display:inline-block;
    transition:opacity 0.2s,transform 0.2s; white-space:nowrap;
    box-shadow:0 0 24px rgba(232,168,56,0.2);
  }
  .lp-btn-amber:hover { opacity:0.88; transform:translateY(-1px); }
  .lp-mob-toggle { display:none; background:none; border:none; color:var(--text); cursor:pointer; padding:6px; }
  .lp-mob-menu {
    display:none; position:fixed; inset:0; z-index:199;
    background:rgba(6,6,6,0.97); backdrop-filter:blur(20px);
    flex-direction:column; align-items:center; justify-content:center; gap:28px;
  }
  .lp-mob-menu.open { display:flex; }
  .lp-mob-link {
    font-family:var(--fh); font-size:26px; font-weight:700;
    color:var(--text); background:none; border:none; cursor:pointer; text-transform:capitalize;
  }

  /* Hero */
  .lp-hero {
    min-height:100vh; width:100%; max-width:100vw;
    display:flex; align-items:center; position:relative; overflow:hidden;
    padding:120px var(--px) 90px;
  }
  .lp-hero-bg { position:absolute; inset:0; z-index:0; }
  .lp-hero-bgimg {
    width:100%; height:100%; object-fit:cover;
    opacity:0.15; filter:grayscale(20%) blur(1px);
  }
  .lp-hero-overlay {
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(6,6,6,0.96) 0%,rgba(6,6,6,0.85) 45%,rgba(10,5,0,0.92) 70%,rgba(6,6,6,0.96) 100%);
  }
  .lp-hero-orb { position:absolute; border-radius:50%; filter:blur(110px); pointer-events:none; }
  .lp-hero-orb-1 { width:680px; height:680px; top:-15%; left:-8%; background:radial-gradient(circle,rgba(232,168,56,0.09) 0%,transparent 70%); }
  .lp-hero-orb-2 { width:480px; height:480px; bottom:-12%; right:-4%; background:radial-gradient(circle,rgba(200,116,42,0.07) 0%,transparent 70%); }
  .lp-hero-grid {
    position:absolute; inset:0;
    background-image:linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px);
    background-size:72px 72px;
  }
  .lp-hero-inner {
    position:relative; z-index:1; width:100%; max-width:var(--max); margin:0 auto;
    display:grid; grid-template-columns:55% 45%; gap:40px; align-items:center; overflow:hidden;
  }
  .lp-hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    border:1px solid rgba(232,168,56,0.22); background:rgba(232,168,56,0.05);
    border-radius:100px; padding:7px 16px; margin-bottom:28px;
  }
  .lp-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); flex-shrink:0; animation:lp-pulse 2s ease-in-out infinite; }
  @keyframes lp-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(232,168,56,0.4)} 50%{opacity:0.6;box-shadow:0 0 0 5px transparent} }
  .lp-hero-badge span { font-size:11.5px; color:rgba(232,168,56,0.9); font-weight:500; letter-spacing:0.04em; }
  .lp-h1 { font-family:var(--fh); font-size:clamp(38px,5.2vw,74px); font-weight:800; line-height:1.04; letter-spacing:-0.035em; margin-bottom:26px; }
  .lp-h1 em {
    font-style:normal;
    background:linear-gradient(90deg,var(--amber),#f5d080,var(--amber));
    background-size:200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:lp-shimmer 4s linear infinite;
  }
  @keyframes lp-shimmer { 0%{background-position:0%} 100%{background-position:200%} }
  .lp-hero-sub { font-size:16px; color:var(--muted); line-height:1.78; max-width:440px; margin-bottom:40px; font-weight:300; }
  .lp-hero-cta { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .lp-btn-lg { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px 30px; border-radius:100px; font-weight:700; font-size:15px; font-family:var(--fb); cursor:pointer; text-decoration:none; transition:all 0.3s; }
  .lp-btn-lg.primary { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#060200; border:none; box-shadow:0 0 36px rgba(232,168,56,0.22); }
  .lp-btn-lg.primary:hover { box-shadow:0 0 56px rgba(232,168,56,0.38); transform:translateY(-2px); }
  .lp-btn-lg.outline { background:transparent; color:var(--text); border:1px solid var(--border2); font-weight:500; }
  .lp-btn-lg.outline:hover { border-color:rgba(255,255,255,0.22); background:rgba(255,255,255,0.03); }
  .lp-hero-trust { display:flex; align-items:center; gap:18px; margin-top:44px; flex-wrap:wrap; }
  .lp-trust-item { display:flex; align-items:center; gap:6px; font-size:12.5px; color:var(--muted); }

  /* Hero right */
  .lp-hero-right { position:relative; height:480px; width:100%; overflow:hidden; }
  .lp-photo-main { position:absolute; top:0; right:0; width:78%; height:68%; border-radius:18px; overflow:hidden; border:1px solid var(--border); background:var(--surface); }
  .lp-photo-main img { width:100%; height:100%; object-fit:cover; filter:grayscale(10%) brightness(0.9); display:block; }
  .lp-photo-main::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 50%,rgba(6,6,6,0.45)); }
  .lp-photo-sm { position:absolute; bottom:0; left:0; width:48%; height:44%; border-radius:14px; overflow:hidden; border:1px solid var(--border); background:var(--surface); }
  .lp-photo-sm img { width:100%; height:100%; object-fit:cover; filter:grayscale(10%) brightness(0.85); display:block; }
  .lp-float-card { position:absolute; background:rgba(15,15,15,0.92); backdrop-filter:blur(20px); border:1px solid var(--border); border-radius:14px; padding:12px 16px; max-width:180px; }
  .lp-fc-1 { bottom:54%; right:2%; animation:lp-float 5s ease-in-out infinite; }
  .lp-fc-2 { bottom:10%; right:2%; animation:lp-float 5s ease-in-out infinite 1.6s; }
  @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  .fc-stat { font-family:var(--fh); font-size:22px; font-weight:800; color:var(--amber); }
  .fc-label { font-size:11px; color:var(--muted); margin-top:2px; }
  .fc-ai { display:flex; align-items:center; gap:8px; }
  .fc-ai-icon { width:28px; height:28px; border-radius:8px; background:rgba(232,168,56,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .fc-ai-text { font-size:12px; color:var(--text); font-weight:500; }
  .fc-ai-sub { font-size:10px; color:var(--muted); }

  /* Stats */
  .lp-stats { border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--surface); overflow:hidden; }
  .lp-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); }
  .lp-stat { padding:40px 24px; text-align:center; border-right:1px solid var(--border); transition:background 0.3s; }
  .lp-stat:last-child { border-right:none; }
  .lp-stat:hover { background:rgba(232,168,56,0.03); }
  .lp-stat-num { font-family:var(--fh); font-size:40px; font-weight:800; letter-spacing:-0.03em; background:linear-gradient(135deg,var(--amber),#f5d080); -webkit-background-clip:text; -webkit-text-fill-color:transparent; line-height:1; }
  .lp-stat-label { font-size:12.5px; color:var(--muted); margin-top:6px; letter-spacing:0.01em; }

  /* Section */
  .lp-section { padding:110px var(--px); }
  .lp-eyebrow { font-size:10.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--amber); margin-bottom:14px; }
  .lp-h2 { font-family:var(--fh); font-size:clamp(30px,3.8vw,54px); font-weight:800; letter-spacing:-0.035em; line-height:1.08; }
  .lp-h2 em { font-style:normal; color:var(--amber); }
  .lp-sub { font-size:15.5px; color:var(--muted); line-height:1.78; max-width:500px; margin-top:14px; font-weight:300; }

  /* About */
  .lp-about-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
  .lp-about-img-wrap { position:relative; }
  .lp-about-img { width:100%; aspect-ratio:4/5; border-radius:24px; overflow:hidden; border:1px solid var(--border); background:var(--surface); }
  .lp-about-img img { width:100%; height:100%; object-fit:cover; filter:grayscale(10%) brightness(0.88); display:block; }
  .lp-about-img-ov { position:absolute; inset:0; border-radius:24px; background:linear-gradient(180deg,transparent 42%,rgba(6,6,6,0.68)); }
  .lp-about-badge { position:absolute; bottom:22px; left:22px; right:22px; background:rgba(6,6,6,0.88); backdrop-filter:blur(16px); border:1px solid var(--border); border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:12px; }
  .lp-about-badge-icon { width:38px; height:38px; border-radius:9px; flex-shrink:0; background:rgba(232,168,56,0.1); display:flex; align-items:center; justify-content:center; }
  .lp-values { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:32px; }
  .lp-val-card { background:var(--surface2); border:1px solid var(--border); border-radius:18px; padding:18px; transition:border-color 0.3s,background 0.3s; }
  .lp-val-card:hover { border-color:rgba(232,168,56,0.18); background:var(--surface); }
  .lp-val-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; font-size:16px; }
  .lp-val-title { font-family:var(--fh); font-size:13.5px; font-weight:700; margin-bottom:5px; }
  .lp-val-text { font-size:12.5px; color:var(--muted); line-height:1.62; }

  /* Bento */
  .lp-bento { display:grid; grid-template-columns:repeat(12,1fr); grid-auto-rows:180px; gap:14px; margin-top:56px; }
  .bc-4 { grid-column:span 4; } .bc-8 { grid-column:span 8; }
  .br-1 { grid-row:span 1; }    .br-2 { grid-row:span 2; }
  .lp-bc {
    background:var(--surface); border:1px solid var(--border); border-radius:24px;
    padding:26px; position:relative; overflow:hidden;
    transition:border-color 0.35s,transform 0.35s; cursor:default;
    display:flex; flex-direction:column;
  }
  .lp-bc:hover { border-color:rgba(255,255,255,0.11); transform:translateY(-3px); }
  .lp-bc::before { content:''; position:absolute; top:-80px; right:-80px; width:220px; height:220px; border-radius:50%; filter:blur(60px); opacity:0; transition:opacity 0.5s; pointer-events:none; }
  .lp-bc:hover::before { opacity:1; }
  .lp-bc.g-amber::before  { background:rgba(232,168,56,0.18); }
  .lp-bc.g-teal::before   { background:rgba(52,211,153,0.14); }
  .lp-bc.g-purple::before { background:rgba(192,132,252,0.13); }
  .lp-bc.g-blue::before   { background:rgba(96,165,250,0.13); }
  .lp-bc.g-orange::before { background:rgba(251,146,60,0.13); }
  .lp-bc.g-cyan::before   { background:rgba(34,211,238,0.12); }
  .lp-bc-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; flex-shrink:0; }
  .lp-bc-title { font-family:var(--fh); font-size:15px; font-weight:700; letter-spacing:-0.015em; margin-bottom:8px; line-height:1.25; }
  .lp-bc.br-2 .lp-bc-title { font-size:19px; }
  .lp-bc-desc { font-size:12.5px; color:var(--muted); line-height:1.65; flex:1; }
  .lp-bc.br-2 .lp-bc-desc { font-size:13.5px; }
  .lp-bc-tag { display:inline-flex; align-items:center; gap:5px; margin-top:12px; padding:5px 12px; border-radius:100px; font-size:10.5px; font-weight:600; letter-spacing:0.03em; align-self:flex-start; }
  .lp-bc.featured { background:var(--surface2); border-color:rgba(232,168,56,0.14); }

  /* Photo strip — real sliding images */
  .lp-strip-wrap { overflow:hidden; padding:0 0 80px; background:var(--bg); border-top:1px solid var(--border); }
  .lp-strip-track { display:flex; gap:14px; width:max-content; animation:lp-strip 22s linear infinite; padding-top:48px; }
  .lp-strip-track:hover { animation-play-state:paused; }
  @keyframes lp-strip { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .lp-strip-img {
    width:300px; height:200px; border-radius:18px; object-fit:cover; flex-shrink:0;
    border:1px solid var(--border); background:var(--surface);
    filter:grayscale(15%) brightness(0.78);
    transition:filter 0.4s,transform 0.4s,border-color 0.4s;
    cursor:pointer;
  }
  .lp-strip-img:hover { filter:grayscale(0%) brightness(1); transform:scale(1.03) translateY(-4px); border-color:rgba(232,168,56,0.3); }

  /* Timeline */
  .lp-timeline-row { display:grid; grid-template-columns:repeat(3,1fr); gap:0; margin-top:60px; position:relative; }
  .lp-timeline-row::before { content:''; position:absolute; top:31px; left:calc(100%/6); right:calc(100%/6); height:1px; background:linear-gradient(90deg,transparent,var(--amber),transparent); }
  .lp-ts { text-align:center; padding:0 28px; }
  .lp-ts-num { width:62px; height:62px; border-radius:50%; margin:0 auto 22px; display:flex; align-items:center; justify-content:center; font-family:var(--fh); font-size:20px; font-weight:800; position:relative; z-index:1; }
  .lp-ts-num.n1 { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#060200; box-shadow:0 0 36px rgba(232,168,56,0.28); }
  .lp-ts-num.n2 { background:var(--surface2); border:1px solid var(--border2); color:var(--amber); }
  .lp-ts-num.n3 { background:var(--surface2); border:1px solid var(--border); color:var(--muted); }
  .lp-ts-title { font-family:var(--fh); font-size:19px; font-weight:700; margin-bottom:10px; letter-spacing:-0.01em; }
  .lp-ts-text  { font-size:13.5px; color:var(--muted); line-height:1.72; }

  /* Testimonials */
  .lp-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:52px; }
  .lp-tc { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:28px; transition:border-color 0.3s,transform 0.3s; }
  .lp-tc:hover { border-color:rgba(232,168,56,0.13); transform:translateY(-3px); }
  .lp-tc-stars { display:flex; gap:3px; margin-bottom:16px; }
  .lp-tc-quote { font-size:14.5px; color:rgba(240,236,228,0.78); line-height:1.78; margin-bottom:22px; font-weight:300; font-style:italic; }
  .lp-tc-author { display:flex; align-items:center; gap:12px; }
  .lp-tc-ava { width:40px; height:40px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:var(--fh); font-size:13px; font-weight:700; }
  .lp-tc-name { font-family:var(--fh); font-size:13.5px; font-weight:700; }
  .lp-tc-role { font-size:11.5px; color:var(--muted); margin-top:2px; }

  /* CTA */
  .lp-cta { padding:130px var(--px); text-align:center; background:var(--bg); position:relative; overflow:hidden; }
  .lp-cta-orb { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:600px; height:600px; border-radius:50%; pointer-events:none; background:radial-gradient(circle,rgba(232,168,56,0.07) 0%,transparent 70%); }
  .lp-cta-h { font-family:var(--fh); font-size:clamp(34px,5.5vw,76px); font-weight:800; letter-spacing:-0.04em; line-height:1.03; max-width:780px; margin:0 auto 22px; position:relative; z-index:1; }
  .lp-cta-sub { font-size:16.5px; color:var(--muted); margin-bottom:44px; position:relative; z-index:1; font-weight:300; }
  .lp-cta-actions { display:flex; align-items:center; justify-content:center; gap:14px; flex-wrap:wrap; position:relative; z-index:1; }

  /* Footer */
  .lp-footer { background:var(--surface); border-top:1px solid var(--border); padding:60px var(--px) 28px; }
  .lp-footer-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:52px; }
  .lp-footer-brand { font-family:var(--fh); font-size:17px; font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .lp-footer-brand-icon { width:30px; height:30px; border-radius:8px; flex-shrink:0; background:linear-gradient(135deg,var(--amber),var(--amber2)); display:flex; align-items:center; justify-content:center; }
  .lp-footer-tagline { font-size:13.5px; color:var(--muted); line-height:1.72; max-width:260px; }
  .lp-footer-col-title { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(240,236,228,0.35); margin-bottom:14px; }
  .lp-footer-links { display:flex; flex-direction:column; gap:9px; }
  .lp-footer-link { font-size:13.5px; color:var(--muted); text-decoration:none; transition:color 0.2s; background:none; border:none; cursor:pointer; text-align:left; }
  .lp-footer-link:hover { color:var(--text); }
  .lp-footer-bottom { display:flex; justify-content:space-between; align-items:center; padding-top:22px; border-top:1px solid var(--border); flex-wrap:wrap; gap:10px; }
  .lp-footer-copy { font-size:12.5px; color:rgba(240,236,228,0.22); }

  /* ===================== Responsive ===================== */
  @media(max-width:1100px) {
    .lp-nav-links,.lp-nav-actions { display:none; }
    .lp-mob-toggle { display:block; }
    .lp-hero-inner { grid-template-columns:1fr; }
    .lp-hero-right { display:none; }
    .lp-about-grid { grid-template-columns:1fr; gap:48px; }
    .lp-footer-top { grid-template-columns:1fr 1fr; gap:32px; }
    .lp-bento { grid-template-columns:1fr 1fr; grid-auto-rows:auto; }
    .bc-4,.bc-8 { grid-column:span 1; }
    .bc-8.featured { grid-column:span 2; }
    .br-1,.br-2 { grid-row:span 1; }
    .lp-bc { min-height:200px; }
  }

  @media(max-width:700px) {
    :root { --px:18px; }

    /* Large blur() filters are a known source of rendering glitches/static
       artifacts on many mobile GPUs. Shrink and soften them drastically,
       and drop the decorative noise overlay + backdrop-filter blur entirely
       on small screens since they're purely cosmetic. */
    .lp-hero-orb { filter:blur(50px) !important; }
    .lp-hero-orb-1 { width:320px !important; height:320px !important; }
    .lp-hero-orb-2 { width:260px !important; height:260px !important; }
    .lp-hero-grid { display:none !important; }
    .lp-noise { display:none !important; }
    .lp-nav { backdrop-filter:none !important; background:rgba(6,6,6,0.98) !important; }
    .lp-float-card { backdrop-filter:none !important; background:rgba(15,15,15,0.98) !important; }
    .lp-about-badge { backdrop-filter:none !important; background:rgba(6,6,6,0.96) !important; }

    .lp-nav { height:60px; }
    .lp-logo span { font-size:14.5px; }
    .lp-logo-icon { width:30px; height:30px; }
    .lp-mob-menu { gap:22px; }
    .lp-mob-link { font-size:23px; }

    .lp-hero { padding:92px 18px 60px; min-height:auto; }
    .lp-hero-badge { padding:6px 14px; margin-bottom:20px; }
    .lp-hero-badge span { font-size:10.5px; }
    .lp-h1 { font-size:clamp(32px,10vw,44px); line-height:1.08; letter-spacing:-0.03em; margin-bottom:18px; }
    .lp-hero-sub { font-size:14.5px; max-width:100%; margin-bottom:28px; line-height:1.7; }
    .lp-hero-cta { flex-direction:column; align-items:stretch; gap:10px; }
    .lp-btn-lg { width:100%; padding:15px 24px; font-size:14.5px; }
    .lp-magnetic-full { display:block; width:100%; }
    .lp-hero-trust { gap:10px 16px; margin-top:30px; }
    .lp-trust-item { font-size:11px; }

    .lp-stats-grid { grid-template-columns:1fr 1fr; }
    .lp-stat { padding:26px 12px; }
    .lp-stat:nth-child(2) { border-right:none; }
    .lp-stat:nth-child(3) { border-top:1px solid var(--border); }
    .lp-stat:nth-child(4) { border-right:none; border-top:1px solid var(--border); }
    .lp-stat-num { font-size:28px; }
    .lp-stat-label { font-size:10.5px; }

    .lp-section { padding:64px 18px; }
    .lp-eyebrow { font-size:10px; margin-bottom:10px; }
    .lp-h2 { font-size:clamp(25px,8vw,34px); }
    .lp-sub { font-size:13.5px; margin-top:10px; }

    .lp-about-img { aspect-ratio:1/1; }
    .lp-about-badge { left:12px; right:12px; bottom:12px; padding:11px 13px; gap:10px; }
    .lp-about-badge-icon { width:32px; height:32px; }
    .lp-values { grid-template-columns:1fr 1fr; gap:10px; margin-top:24px; }
    .lp-val-card { padding:13px; border-radius:14px; }
    .lp-val-icon { width:30px; height:30px; margin-bottom:8px; }
    .lp-val-title { font-size:12px; }
    .lp-val-text { font-size:11px; }

    .lp-bento { grid-template-columns:1fr; gap:12px; margin-top:36px; }
    .bc-4,.bc-8,.bc-8.featured { grid-column:span 1; }
    .lp-bc { min-height:0; padding:22px; border-radius:20px; }
    .lp-bc-icon { width:40px; height:40px; margin-bottom:12px; border-radius:11px; }
    .lp-bc-title { font-size:15.5px; }
    .lp-bc.br-2 .lp-bc-title { font-size:17px; }
    .lp-bc-desc { font-size:12.5px; }
    .lp-bc.br-2 .lp-bc-desc { font-size:13px; }

    .lp-strip-wrap { padding-bottom:56px; }
    .lp-strip-img { width:210px; height:145px; border-radius:14px; }
    .lp-strip-track { padding-top:32px; gap:10px; animation-duration:16s; }

    .lp-timeline-row { grid-template-columns:1fr; gap:32px; margin-top:44px; }
    .lp-timeline-row::before { display:none; }
    .lp-ts { padding:0 6px; }
    .lp-ts-num { width:52px; height:52px; font-size:17px; margin-bottom:14px; }
    .lp-ts-title { font-size:17px; }
    .lp-ts-text { font-size:13px; }

    .lp-testi-grid { grid-template-columns:1fr; gap:12px; margin-top:36px; }
    .lp-tc { padding:20px; border-radius:18px; }
    .lp-tc-quote { font-size:13.5px; margin-bottom:18px; }

    .lp-cta { padding:80px 18px; }
    .lp-cta-h { font-size:clamp(26px,9vw,38px); }
    .lp-cta-sub { font-size:14px; margin-bottom:32px; }
    .lp-cta-actions { flex-direction:column; align-items:stretch; width:100%; gap:10px; }

    .lp-footer { padding:44px 18px 20px; }
    .lp-footer-top { grid-template-columns:1fr; gap:28px; margin-bottom:32px; }
    .lp-footer-bottom { flex-direction:column; align-items:flex-start; gap:8px; }
  }

  @media(max-width:420px) {
    .lp-values { grid-template-columns:1fr; }
    .lp-stats-grid { grid-template-columns:1fr; }
    .lp-stat { border-right:none !important; border-top:1px solid var(--border); }
    .lp-stat:first-child { border-top:none; }
    .lp-h1 { font-size:clamp(28px,11vw,36px); }
    .lp-hero-trust { gap:8px 14px; }
  }
`;

const BENTO = [
  { col:'bc-8', row:'br-2', glow:'g-amber', featured:true, icon:Brain, iconBg:'rgba(232,168,56,0.1)', iconColor:'#e8a838', title:'AI-Powered Status Updates', desc:'Write a quick teacher note — AI transforms it into a warm, professional parent message. Powered by Groq. Works in Amharic too.', tag:'Powered by Groq', tagBg:'rgba(232,168,56,0.1)', tagColor:'#e8a838' },
  { col:'bc-4', row:'br-2', glow:'g-teal',  icon:Bell, iconBg:'rgba(52,211,153,0.1)', iconColor:'#34d399', title:'Live Notifications', desc:'Parents receive instant socket-powered updates the moment a teacher logs a note about their child.', tag:'Real-time', tagBg:'rgba(52,211,153,0.08)', tagColor:'#34d399' },
  { col:'bc-4', row:'br-1', glow:'g-purple', icon:Video, iconBg:'rgba(192,132,252,0.1)', iconColor:'#c084fc', title:'Virtual Meetings', desc:'Built-in Jitsi video rooms. No downloads, no external accounts needed.', tag:'Jitsi Meet', tagBg:'rgba(192,132,252,0.08)', tagColor:'#c084fc' },
  { col:'bc-4', row:'br-1', glow:'g-blue',   icon:Languages, iconBg:'rgba(96,165,250,0.1)', iconColor:'#60a5fa', title:'Amharic Translation', desc:'One click translates all summaries to Amharic. Built for Ethiopian families.', tag:'አማርኛ', tagBg:'rgba(96,165,250,0.08)', tagColor:'#60a5fa' },
  { col:'bc-4', row:'br-1', glow:'g-cyan',   icon:CheckSquare, iconBg:'rgba(34,211,238,0.1)', iconColor:'#22d3ee', title:'Attendance Tracking', desc:'Digital daily roll call with a full 90-day history for students and parents.', tag:'Digital', tagBg:'rgba(34,211,238,0.08)', tagColor:'#22d3ee' },
  { col:'bc-8', row:'br-1', glow:'g-orange', featured:true, icon:Trophy, iconBg:'rgba(251,146,60,0.1)', iconColor:'#fb923c', title:'Student Leaderboard & Recognition', desc:'Section-level academic rankings to inspire healthy competition and reward consistent effort.', tag:'Motivation', tagBg:'rgba(251,146,60,0.08)', tagColor:'#fb923c' },
];

const TESTIMONIALS = [
  { initials:'TH', name:'Tigist Haile',  role:'Parent · Grade 7',     bg:'rgba(52,211,153,0.12)',  tc:'#34d399', quote:'For the first time I know exactly how my daughter is doing — in Amharic! The AI summaries arrive instantly.' },
  { initials:'AB', name:'Abebe Bekele', role:'Teacher · Mathematics', bg:'rgba(192,132,252,0.12)', tc:'#c084fc', quote:'I write a 2-sentence note and the AI writes a beautiful parent message. Saves me hours every week.' },
  { initials:'YA', name:'Yonas Alemu',  role:'Student · Grade 10A',   bg:'rgba(232,168,56,0.12)',  tc:'#e8a838', quote:'The leaderboard pushes me to study harder. Virtual meetings with my teachers changed everything.' },
];

const Navbar = ({ scrolled, mobileOpen, setMobileOpen }) => {
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMobileOpen(false); };
  const NAV = ['about','features','how-it-works','testimonials'];
  return (
    <>
      <nav className={`lp-nav${scrolled ? ' sc' : ''}`}>
        <Link to="/" className="lp-logo">
          <div className="lp-logo-icon"><GraduationCap size={17} color="#060200"/></div>
          <span>Addis Bright</span>
        </Link>
        <div className="lp-nav-links">
          {NAV.map(id => <button key={id} className="lp-navbtn" onClick={() => go(id)}>{id.replace(/-/g,' ')}</button>)}
        </div>
        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn-ghost">Log in</Link>
          <Link to="/register" className="lp-btn-amber">Get started</Link>
        </div>
        <button className="lp-mob-toggle" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </nav>
      <div className={`lp-mob-menu${mobileOpen ? ' open' : ''}`}>
        {NAV.map(id => <button key={id} className="lp-mob-link" onClick={() => go(id)}>{id.replace(/-/g,' ')}</button>)}
        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <Link to="/login" className="lp-btn-ghost" onClick={() => setMobileOpen(false)}>Log in</Link>
          <Link to="/register" className="lp-btn-amber" onClick={() => setMobileOpen(false)}>Get started</Link>
        </div>
      </div>
    </>
  );
};

const HeroSection = () => (
  <section className="lp-hero">
    <div className="lp-hero-bg">
      <img src={heroBg} alt="" className="lp-hero-bgimg" loading="eager"/>
      <div className="lp-hero-overlay"/>
    </div>
    <div className="lp-hero-orb lp-hero-orb-1"/><div className="lp-hero-orb lp-hero-orb-2"/>
    <div className="lp-hero-grid"/><Noise/>
    <div className="lp-hero-inner">
      <div>
        <div className="lp-hero-badge"><div className="lp-badge-dot"/><span>Now serving Addis Ababa schools</span></div>
        <h1 className="lp-h1">Education<br/><em>Reimagined</em><br/>for Ethiopia</h1>
        <p className="lp-hero-sub">A modern school management platform connecting directors, teachers, parents and students — powered by AI, real-time data, and Amharic support.</p>
        <div className="lp-hero-cta">
          <MagneticBtn className="lp-magnetic-full"><Link to="/register" className="lp-btn-lg primary">Get started free <ChevronRight size={16}/></Link></MagneticBtn>
          <Link to="/login" className="lp-btn-lg outline">Sign in <ArrowUpRight size={15}/></Link>
        </div>
        <div className="lp-hero-trust">
          {[['🎓','5 role portals'],['⚡','Real-time'],['🌐','Amharic ready'],['🔒','Secure']].map(([e,t]) => (
            <div key={t} className="lp-trust-item"><span>{e}</span><span>{t}</span></div>
          ))}
        </div>
      </div>
      <div className="lp-hero-right">
        <div className="lp-photo-main"><img src={heroMain} alt="Students learning" loading="eager"/></div>
        <div className="lp-photo-sm"><img src={heroSmall} alt="Teacher in class" loading="lazy"/></div>
        <div className="lp-float-card lp-fc-1"><div className="fc-stat">94%</div><div className="fc-label">Attendance rate</div></div>
        <div className="lp-float-card lp-fc-2">
          <div className="fc-ai">
            <div className="fc-ai-icon"><Brain size={14} color="#e8a838"/></div>
            <div><div className="fc-ai-text">AI enrichment active</div><div className="fc-ai-sub">Amharic translation ON</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const StatsSection = () => (
  <div className="lp-stats">
    <div className="lp-wrap">
      <div className="lp-stats-grid">
        {[{n:1200,s:'+',l:'Students enrolled'},{n:94,s:'%',l:'Attendance rate'},{n:85,s:'+',l:'Teachers'},{n:15,s:'+',l:'Years of excellence'}].map(({n,s,l}) => (
          <Reveal key={l} className="lp-stat">
            <div className="lp-stat-num"><Counter target={n} suffix={s}/></div>
            <div className="lp-stat-label">{l}</div>
          </Reveal>
        ))}
      </div>
    </div>
  </div>
);

const AboutSection = () => (
  <section className="lp-section" id="about" style={{ background:'var(--bg)' }}>
    <div className="lp-wrap">
      <div className="lp-about-grid">
        <Reveal>
          <div className="lp-about-img-wrap">
            <div className="lp-about-img"><img src={aboutImg} alt="School graduation" loading="lazy"/></div>
            <div className="lp-about-img-ov"/>
            <div className="lp-about-badge">
              <div className="lp-about-badge-icon"><GraduationCap size={17} color="#e8a838"/></div>
              <div>
                <div style={{ fontFamily:'var(--fh)', fontWeight:700, fontSize:13 }}>Est. 2009</div>
                <div style={{ fontSize:11.5, color:'var(--muted)', marginTop:2 }}>15 years of Ethiopian excellence</div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="lp-eyebrow">About Addis Bright</p>
          <h2 className="lp-h2">Building the future of<br/><em>Ethiopian</em> education</h2>
          <p className="lp-sub">We bridge the gap between teachers, parents and students — creating a transparent, connected school community powered by modern technology and AI built for Ethiopia.</p>
          <div className="lp-values">
            {[
              {i:'🎯',bg:'rgba(232,168,56,0.08)', t:'Our Mission',d:'Empower every student to reach their fullest potential through innovation and care.'},
              {i:'💡',bg:'rgba(96,165,250,0.08)',  t:'Our Vision', d:'World-class education accessible to every Ethiopian child.'},
              {i:'❤️',bg:'rgba(248,113,113,0.08)', t:'Our Values', d:'Respect, integrity and excellence in every interaction.'},
              {i:'🛡️',bg:'rgba(52,211,153,0.08)', t:'Our Promise',d:'A safe, nurturing environment where students feel valued every day.'},
            ].map(({i,bg,t,d}) => (
              <div key={t} className="lp-val-card">
                <div className="lp-val-icon" style={{background:bg}}><span>{i}</span></div>
                <div className="lp-val-title">{t}</div>
                <div className="lp-val-text">{d}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="lp-section" id="features" style={{ background:'var(--surface)' }}>
    <div className="lp-wrap">
      <Reveal>
        <p className="lp-eyebrow">Platform features</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:14 }}>
          <h2 className="lp-h2">Everything a modern<br/>school <em>needs</em></h2>
          <p className="lp-sub" style={{ marginTop:0 }}>Built specifically for Ethiopian schools — local needs, global standards.</p>
        </div>
      </Reveal>
      <div className="lp-bento">
        {BENTO.map(({col,row,glow,featured,icon:Icon,iconBg,iconColor,title,desc,tag,tagBg,tagColor},idx) => (
          <Reveal key={title} delay={idx*0.06} className={`lp-bc ${col} ${row} ${glow}${featured?' featured':''}`}>
            <div className="lp-bc-icon" style={{background:iconBg}}><Icon size={21} color={iconColor}/></div>
            <div className="lp-bc-title">{title}</div>
            <div className="lp-bc-desc">{desc}</div>
            <div className="lp-bc-tag" style={{background:tagBg,color:tagColor}}><Sparkles size={9}/> {tag}</div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

// Photo strip using all 4 real images — repeated to fill the infinite scroll
const PhotoStrip = () => {
  const imgs = [
    { src: heroBg,    alt: 'School background' },
    { src: heroMain,  alt: 'Students learning' },
    { src: heroSmall, alt: 'Teacher in class'  },
    { src: aboutImg,  alt: 'Graduation'        },
  ];
  // Duplicate 4 times so the loop is seamless
  const all = [...imgs, ...imgs, ...imgs, ...imgs];
  return (
    <div className="lp-strip-wrap">
      <div className="lp-strip-track">
        {all.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt} className="lp-strip-img" loading="lazy"/>
        ))}
      </div>
    </div>
  );
};

const TimelineSection = () => (
  <section className="lp-section" id="how-it-works" style={{ background:'var(--bg)' }}>
    <div className="lp-wrap" style={{ textAlign:'center' }}>
      <Reveal><p className="lp-eyebrow">How it works</p><h2 className="lp-h2">Up and running in <em>3 steps</em></h2></Reveal>
      <div className="lp-timeline-row">
        {[
          {emoji:'📋',t:'Register',      cls:'n1',delay:0,    d:'The registrar creates full profiles for students, teachers and parents — with photos, addresses and section assignments.'},
          {emoji:'🔔',t:'Stay connected',cls:'n2',delay:0.15, d:'Teachers post updates, mark attendance and enter grades. Parents get instant notifications in Amharic or English.'},
          {emoji:'📈',t:'Track progress',cls:'n3',delay:0.3,  d:"Directors see live analytics, parents follow their child's growth, students compete on the leaderboard."},
        ].map(({emoji,t,cls,delay,d}) => (
          <Reveal key={t} delay={delay} className="lp-ts">
            <div className={`lp-ts-num ${cls}`}>{emoji}</div>
            <div className="lp-ts-title">{t}</div>
            <p className="lp-ts-text">{d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="lp-section" id="testimonials" style={{ background:'var(--surface)' }}>
    <div className="lp-wrap">
      <Reveal><p className="lp-eyebrow">Testimonials</p><h2 className="lp-h2">Voices from our <em>community</em></h2></Reveal>
      <div className="lp-testi-grid">
        {TESTIMONIALS.map(({initials,name,role,bg,tc,quote},i) => (
          <Reveal key={name} delay={i*0.1} className="lp-tc">
            <div className="lp-tc-stars">{[1,2,3,4,5].map(s => <Star key={s} size={12} color="#e8a838" fill="#e8a838"/>)}</div>
            <p className="lp-tc-quote">"{quote}"</p>
            <div className="lp-tc-author">
              <div className="lp-tc-ava" style={{background:bg,color:tc}}>{initials}</div>
              <div><div className="lp-tc-name">{name}</div><div className="lp-tc-role">{role}</div></div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="lp-cta">
    <div className="lp-cta-orb"/><Noise/>
    <div className="lp-wrap" style={{ position:'relative', zIndex:1 }}>
      <Reveal>
        <p className="lp-eyebrow" style={{ marginBottom:18 }}>Get started today</p>
        <h2 className="lp-cta-h">Ready to transform<br/><em style={{ fontStyle:'normal', color:'var(--amber)' }}>your school?</em></h2>
        <p className="lp-cta-sub">Join Addis Bright Academy's digital platform and connect your entire school community.</p>
        <div className="lp-cta-actions">
          <MagneticBtn className="lp-magnetic-full"><Link to="/register" className="lp-btn-lg primary">Create account <ChevronRight size={16}/></Link></MagneticBtn>
          <Link to="/login" className="lp-btn-lg outline">Sign in</Link>
        </div>
      </Reveal>
    </div>
  </section>
);

const Footer = () => (
  <footer className="lp-footer">
    <div className="lp-wrap">
      <div className="lp-footer-top">
        <div>
          <div className="lp-footer-brand">
            <div className="lp-footer-brand-icon"><GraduationCap size={15} color="#060200"/></div>
            Addis Bright
          </div>
          <p className="lp-footer-tagline">Empowering Ethiopian education through technology, connection and innovation since 2009.</p>
          <p style={{ fontSize:12.5, color:'rgba(240,236,228,0.22)', marginTop:14 }}>📍 Addis Ababa, Ethiopia</p>
        </div>
        {[
          {title:'Platform',links:['Features','How it works','About','Testimonials']},
          {title:'Portals', links:['Director','Registrar','Teacher','Parent','Student']},
          {title:'Support', links:['Help Center','Privacy Policy','Terms','Contact']},
        ].map(({title,links}) => (
          <div key={title}>
            <p className="lp-footer-col-title">{title}</p>
            <div className="lp-footer-links">{links.map(l => <span key={l} className="lp-footer-link">{l}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="lp-footer-bottom">
        <p className="lp-footer-copy">© {new Date().getFullYear()} Addis Bright Academy. All rights reserved.</p>
        <p className="lp-footer-copy">Made with ❤️ by NAHOM</p>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="lp">
      <style>{CSS}</style>
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <HeroSection/>
      <StatsSection/>
      <AboutSection/>
      <FeaturesSection/>
      <PhotoStrip/>
      <TimelineSection/>
      <TestimonialsSection/>
      <CTASection/>
      <Footer/>
    </div>
  );
}
