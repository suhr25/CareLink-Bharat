import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate(`/?error=${encodeURIComponent(error || 'Google sign-in failed')}`);
      return;
    }

    sessionStorage.setItem('accessToken', token);

    api.get('/auth/me')
      .then(({ data }) => {
        loginWithToken(token, data.data.user);
        navigate('/');
      })
      .catch(() => {
        sessionStorage.removeItem('accessToken');
        navigate('/?error=Failed+to+fetch+user+profile');
      });
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 16,
      color: 'var(--text-dim, #888)',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid var(--primary, #4f9cf9)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p>Completing sign-in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
