'use client';

import Wordmark from '@/components/ui/Wordmark';

interface Props { onNext: (provider: string) => void; }

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.2C41.9 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M16.36 12.78c.02 2.4 2.1 3.2 2.13 3.21-.02.06-.33 1.14-1.1 2.25-.66.97-1.35 1.93-2.44 1.95-1.07.02-1.41-.63-2.63-.63-1.22 0-1.6.61-2.61.65-1.05.04-1.85-1.05-2.52-2.01-1.36-1.97-2.4-5.56-1-7.99.69-1.2 1.93-1.97 3.28-1.99 1.03-.02 2 .69 2.63.69.63 0 1.81-.86 3.05-.73.52.02 1.98.21 2.92 1.58-.08.05-1.74 1.02-1.72 3.02M14.4 5.2c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.38-1.14" />
    </svg>
  );
}

function KakaoLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#000" aria-hidden>
      <path d="M12 3C6.48 3 2 6.58 2 10.95c0 2.82 1.9 5.29 4.76 6.68-.21.74-.76 2.69-.87 3.11-.14.52.19.51.4.37.17-.11 2.63-1.79 3.7-2.52.66.09 1.33.14 2.01.14 5.52 0 10-3.58 10-7.95S17.52 3 12 3z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: 'kakao', label: '카카오로 계속하기', bg: '#FEE500', color: '#1A1A1A', border: 'transparent', logo: <KakaoLogo /> },
  { id: 'google', label: 'Google로 계속하기', bg: '#FFFFFF', color: '#1A1A1A', border: 'transparent', logo: <GoogleLogo /> },
  { id: 'apple', label: 'Apple로 계속하기', bg: '#1B1813', color: '#FFFFFF', border: '1.5px solid var(--border-strong)', logo: <AppleLogo /> },
];

export default function OnbLogin({ onNext }: Props) {
  return (
    <div style={{ flex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', padding: '0 28px calc(28px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,131,27,0.16), transparent 62%)', animation: 'coral-breath 2.8s ease-in-out infinite' }} />
          <div className="glyph" style={{ fontSize: 58, color: 'var(--brand)', lineHeight: 1 }}>命</div>
        </div>
        <Wordmark size={28} />
        <p className="kr" style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 280 }}>
          나를 비추는 사주 클론.<br />간편하게 시작해보세요.
        </p>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onNext(p.id)}
            style={{ height: 52, borderRadius: 12, background: p.bg, color: p.color, border: p.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 700, position: 'relative' }}
          >
            <span style={{ position: 'absolute', left: 18, display: 'inline-flex' }}>{p.logo}</span>
            {p.label}
          </button>
        ))}
        <p className="kr" style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--fg-4)', textAlign: 'center', lineHeight: 1.5 }}>
          계속 진행하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
