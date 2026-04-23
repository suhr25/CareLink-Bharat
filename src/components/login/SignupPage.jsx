import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
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

export default function SignupPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strengthLevel = getPasswordStrength();
  const strengthColors = ['var(--danger)', 'var(--accent)', 'var(--accent)', 'var(--emerald)', 'var(--primary)'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !username || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await register({ name, username, email, password });
      setSuccess(`Account created! Welcome, ${name}!`);
      // AuthContext sets user → App.jsx redirects to /dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <motion.div
      className="auth-card auth-card--scrollable"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card-glow" style={{ background: 'radial-gradient(ellipse, rgba(123,104,238,0.1) 0%, transparent 70%)' }} />

      <motion.div
        className="auth-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="auth-icon-ring" style={{ background: 'linear-gradient(135deg, rgba(123,104,238,0.15), rgba(240,160,80,0.08))', borderColor: 'rgba(123,104,238,0.2)' }}>
          <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--purple)' }} />
        </div>
        <h1>Create Account</h1>
        <p>Join CareLink Bharat today</p>
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
        Sign up with Google
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
        {[
          { label: 'Full Name', icon: <UserPlus size={18} />, type: 'text', value: name, setter: setName, placeholder: 'Your full name', autoComplete: 'name' },
          { label: 'Username', icon: <User size={18} />, type: 'text', value: username, setter: setUsername, placeholder: 'Choose a username', autoComplete: 'username' },
          { label: 'Email', icon: <Mail size={18} />, type: 'email', value: email, setter: setEmail, placeholder: 'your@email.com', autoComplete: 'email' },
        ].map((field, i) => (
          <motion.div
            key={field.label}
            className="field-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
          >
            <label className="field-label">{field.label}</label>
            <div className="input-wrapper">
              {field.icon}
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                autoComplete={field.autoComplete}
              />
            </div>
          </motion.div>
        ))}

        <motion.div
          className="field-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.46, duration: 0.4 }}
        >
          <label className="field-label">Password</label>
          <div className="input-wrapper">
            <Lock size={18} />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className="toggle-password-btn" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strengthLevel ? strengthColors[Math.min(strengthLevel - 1, 4)] : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: strengthColors[Math.min(strengthLevel - 1, 4)] || 'var(--text-dim)' }}>
                {strengthLabels[strengthLevel]}
              </span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="field-group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.53, duration: 0.4 }}
        >
          <label className="field-label">Confirm Password</label>
          <div className="input-wrapper">
            <CheckCircle size={18} />
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </motion.div>

        {error && (
          <motion.div className="message-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>
        )}
        {success && (
          <motion.div className="message-success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>✨ {success}</motion.div>
        )}

        <motion.button
          type="submit"
          className="btn-primary btn-purple"
          disabled={loading}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="btn-content">
            {loading ? <div className="btn-spinner" /> : <><span>Create Account</span><ArrowRight size={18} /></>}
          </span>
        </motion.button>
      </form>

      <motion.div className="auth-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>← Sign in</a>
      </motion.div>
    </motion.div>
  );
}
