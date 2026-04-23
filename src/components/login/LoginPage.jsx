import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function LoginPage({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login({ username, password, rememberMe });
      // AuthContext sets user → App.jsx redirects to /dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card-glow" />

      <motion.div
        className="auth-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="auth-icon-ring">
          <User size={30} strokeWidth={1.5} />
        </div>
        <h1>Welcome Back</h1>
        <p>Sign in to continue your journey</p>
      </motion.div>

      {/* Google OAuth */}
      <motion.button
        type="button"
        className="btn-google"
        onClick={handleGoogle}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <GoogleIcon />
        Continue with Google
      </motion.button>

      <motion.div
        className="auth-divider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.4 }}
      >
        <span>or</span>
      </motion.div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <motion.div
          className="field-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <label className="field-label">Username or Email</label>
          <div className="input-wrapper">
            <User size={18} />
            <input
              type="text"
              placeholder="Enter your username or email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
        </motion.div>

        <motion.div
          className="field-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
        >
          <label className="field-label">Password</label>
          <div className="input-wrapper">
            <Lock size={18} />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="toggle-password-btn" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="form-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.4 }}
        >
          <label className="checkbox-label">
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            Remember me
          </label>
          <a href="#" className="forgot-link" onClick={e => e.preventDefault()}>Forgot password?</a>
        </motion.div>

        {error && (
          <motion.div className="message-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="btn-primary"
          disabled={loading}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="btn-content">
            {loading ? <div className="btn-spinner" /> : <><span>Sign In</span><ArrowRight size={18} /></>}
          </span>
        </motion.button>
      </form>

      <motion.div
        className="auth-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52, duration: 0.4 }}
      >
        Don't have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Create one →</a>
      </motion.div>
    </motion.div>
  );
}
