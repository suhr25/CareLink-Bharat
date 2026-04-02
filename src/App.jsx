import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Preloader from './components/ui/Preloader';
import CosmicBackground from './components/three/CosmicBackground';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/login/SignupPage';
import DashboardPage from './components/dashboard/DashboardPage';

// ── LOCAL STORAGE UTILS ──
function getUsers() {
    try { return JSON.parse(localStorage.getItem('cl_users') || '[]'); }
    catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem('cl_users', JSON.stringify(users));
}

function initDefaults() {
    if (!getUsers().length) {
        saveUsers([
            { name: 'Admin', username: 'admin', password: 'carelink2026' },
            { name: 'Suhrid Marwah', username: 'suhrid', password: 'pstoJT@2026' },
            { name: 'Ashnaa Seth', username: 'ashnaa', password: 'pstoJT@2026' },
        ]);
    }
}

export default function App() {
    const [preloaderDone, setPreloaderDone] = useState(false);
    const [user, setUser] = useState(localStorage.getItem('cl_user'));
    const [name, setName] = useState(localStorage.getItem('cl_name'));
    const [isSignup, setIsSignup] = useState(false);
    const [transitioning, setTransitioning] = useState(false);

    // Init default users on first load
    useState(() => initDefaults());

    const handleLogin = useCallback((userData) => {
        setTransitioning(true);
        setTimeout(() => {
            localStorage.setItem('cl_user', userData.username);
            localStorage.setItem('cl_name', userData.name || userData.username);
            setUser(userData.username);
            setName(userData.name || userData.username);
            setTransitioning(false);
        }, 600);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('cl_user');
        localStorage.removeItem('cl_name');
        setUser(null);
        setName(null);
        setIsSignup(false);
    }, []);

    return (
        <>
            {/* Preloader */}
            <Preloader onComplete={() => setPreloaderDone(true)} />

            {/* Page transition overlay */}
            <AnimatePresence>
                {transitioning && (
                    <motion.div
                        className="page-transition-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.span
                            className="page-transition-text"
                            initial={{ opacity: 0, letterSpacing: '12px' }}
                            animate={{ opacity: 1, letterSpacing: '4px' }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Welcome
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            {preloaderDone && (
                <AnimatePresence mode="wait">
                    {!user ? (
                        <motion.div
                            key="auth"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <CosmicBackground />
                            <div className="auth-container">
                                <motion.div
                                    className="auth-brand"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <h2 className="auth-brand-name">
                                        <span className="primary">CareLink</span>
                                        {' '}
                                        <span className="accent">Bharat</span>
                                    </h2>
                                    <p className="auth-brand-tagline">Voice-Guided Digital Assistance</p>
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    {!isSignup ? (
                                        <LoginPage
                                            key="login"
                                            onLogin={handleLogin}
                                            onSwitchToSignup={() => setIsSignup(true)}
                                            users={getUsers()}
                                        />
                                    ) : (
                                        <SignupPage
                                            key="signup"
                                            onLogin={handleLogin}
                                            onSwitchToLogin={() => setIsSignup(false)}
                                            users={getUsers()}
                                            saveUsers={saveUsers}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <DashboardPage name={name} onLogout={handleLogout} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
}
