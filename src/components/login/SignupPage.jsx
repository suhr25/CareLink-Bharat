import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage({ onLogin, onSwitchToLogin, users, saveUsers }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
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
        if (!name || !username || !password || !confirm) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 900));
        setLoading(false);

        if (users.find(u => u.username === username.toLowerCase())) {
            setError('Username is already taken.');
            return;
        }

        const newUsers = [...users, { name, username: username.toLowerCase(), password }];
        saveUsers(newUsers);
        setSuccess(`Account created! Welcome, ${name}!`);

        await new Promise(r => setTimeout(r, 1200));
        onLogin({ name, username: username.toLowerCase() });
    };

    const formFields = [
        { label: 'Full Name', icon: <UserPlus size={18} />, type: 'text', value: name, setter: setName, placeholder: 'Your full name' },
        { label: 'Username', icon: <User size={18} />, type: 'text', value: username, setter: setUsername, placeholder: 'Choose a username' },
    ];

    return (
        <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
            <div className="auth-card-glow" style={{
                background: 'radial-gradient(ellipse, rgba(123,104,238,0.1) 0%, transparent 70%)'
            }} />

            <motion.div
                className="auth-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
            >
                <div className="auth-icon-ring" style={{
                    background: 'linear-gradient(135deg, rgba(123,104,238,0.15), rgba(240,160,80,0.08))',
                    borderColor: 'rgba(123,104,238,0.2)'
                }}>
                    <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--purple)' }} />
                </div>
                <h1>Create Account</h1>
                <p>Join CareLink Bharat today</p>
            </motion.div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {formFields.map((field, i) => (
                    <motion.div
                        key={field.label}
                        className="field-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                    >
                        <label className="field-label">{field.label}</label>
                        <div className="input-wrapper">
                            {field.icon}
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={field.value}
                                onChange={e => field.setter(e.target.value)}
                            />
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    className="field-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.36, duration: 0.4 }}
                >
                    <label className="field-label">Password</label>
                    <div className="input-wrapper">
                        <Lock size={18} />
                        <input
                            type={showPwd ? 'text' : 'password'}
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPwd(!showPwd)}
                        >
                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {password && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: 8 }}
                        >
                            <div style={{
                                display: 'flex',
                                gap: 4,
                                marginBottom: 4,
                            }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        flex: 1,
                                        height: 3,
                                        borderRadius: 2,
                                        background: i <= strengthLevel
                                            ? strengthColors[Math.min(strengthLevel - 1, 4)]
                                            : 'rgba(255,255,255,0.06)',
                                        transition: 'background 0.3s',
                                    }} />
                                ))}
                            </div>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: strengthColors[Math.min(strengthLevel - 1, 4)] || 'var(--text-dim)',
                            }}>
                                {strengthLabels[strengthLevel]}
                            </span>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    className="field-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.44, duration: 0.4 }}
                >
                    <label className="field-label">Confirm Password</label>
                    <div className="input-wrapper">
                        <CheckCircle size={18} />
                        <input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        className="message-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        className="message-success"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        ✨ {success}
                    </motion.div>
                )}

                <motion.button
                    type="submit"
                    className="btn-primary btn-purple"
                    disabled={loading}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="btn-content">
                        {loading ? (
                            <div className="btn-spinner" />
                        ) : (
                            <>
                                Create Account
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
                transition={{ delay: 0.6 }}
            >
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
                    ← Sign in
                </a>
            </motion.div>
        </motion.div>
    );
}
