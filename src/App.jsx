import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Preloader from './components/ui/Preloader';
import CosmicBackground from './components/three/CosmicBackground';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/login/SignupPage';
import DashboardPage from './components/dashboard/DashboardPage';
import GoogleCallback from './components/auth/GoogleCallback';
import { useAuth } from './context/AuthContext';

function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  return (
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

        {oauthError && (
          <motion.div
            className="message-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 16, maxWidth: 400, textAlign: 'center' }}
          >
            {decodeURIComponent(oauthError)}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isSignup ? (
            <LoginPage
              key="login"
              onSwitchToSignup={() => setIsSignup(true)}
            />
          ) : (
            <SignupPage
              key="signup"
              onSwitchToLogin={() => setIsSignup(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setPreloaderDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Trigger the transition overlay when logging in
  useEffect(() => {
    if (user && preloaderDone) {
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), 700);
      return () => clearTimeout(t);
    }
  }, [user, preloaderDone]);

  return (
    <>
      <Preloader onComplete={() => setPreloaderDone(true)} />

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

      {preloaderDone && !loading && (
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/auth/callback" element={<GoogleCallback />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <DashboardPage onLogout={handleLogout} />
                  </motion.div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <AuthScreen />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      )}

      {!preloaderDone && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: 10, opacity: 0.3, zIndex: 10001 }}>
          Loading...
        </div>
      )}
    </>
  );
}
