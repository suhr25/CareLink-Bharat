import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage({ onLogin, onSwitchToSignup, users }) {
    const [username, setUsername] = useState(localStorage.getItem('cl_user') || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        setLoading(false);
        const valid = users.find(u => u.username === username && u.password === password);
        if (valid) {
            if (rememberMe) localStorage.setItem('cl_user', username);
            onLogin(valid);
        } else {
            setError('Incorrect username or password.');
        }
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

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <motion.div
                    className="field-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <label className="field-label">Username</label>
                    <div className="input-wrapper">
                        <User size={18} />
                        <input
                            type="text"
                            placeholder="Enter your username"
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
                    transition={{ delay: 0.3, duration: 0.4 }}
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
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPwd(!showPwd)}
                        >
                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className="form-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                >
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                        />
                        Remember me
                    </label>
                    <a href="#" className="forgot-link" onClick={e => e.preventDefault()}>
                        Forgot password?
                    </a>
                </motion.div>

                {error && (
                    <motion.div
                        className="message-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.div>
                )}

                <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="btn-content">
                        {loading ? (
                            <div className="btn-spinner" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </span>
                </motion.button>
            </form>

            <motion.div
                className="auth-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
            >
                Don't have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>
                    Create one →
                </a>
            </motion.div>
        </motion.div>
    );
}
