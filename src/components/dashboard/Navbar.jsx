import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, History, LogOut, Zap, ChevronDown } from 'lucide-react';

export default function Navbar({ user, lang, onToggleLang, onOpenHistory, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const firstName = (user?.name || '').split(' ')[0] || 'User';
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-logo-group">
        <motion.div
          className="nav-logo-icon"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Zap size={20} />
        </motion.div>
        <div className="nav-logo">
          <span className="primary">CareLink</span>{' '}
          <span className="accent">Bharat</span>
        </div>
      </div>

      <div className="nav-actions">
        {/* Profile chip with dropdown */}
        <div className="nav-profile-wrapper" ref={dropdownRef}>
          <motion.button
            className="nav-chip"
            onClick={() => setProfileOpen(o => !o)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="nav-chip-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
              ) : (
                <span className="nav-chip-initials">{initials}</span>
              )}
            </div>
            <span className="nav-chip-name">{firstName}</span>
            <ChevronDown size={13} style={{ opacity: 0.6, marginLeft: 2, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="nav-profile-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <div className="npd-header">
                  <div className="npd-avatar">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="npd-info">
                    <span className="npd-name">{user?.name || 'User'}</span>
                    <span className="npd-email">{user?.email || ''}</span>
                    {user?.authProvider === 'google' && (
                      <span className="npd-badge">
                        <svg width="11" height="11" viewBox="0 0 48 48" style={{ marginRight: 4 }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Signed in with Google
                      </span>
                    )}
                  </div>
                </div>
                <div className="npd-divider" />
                <button className="npd-logout" onClick={() => { setProfileOpen(false); onLogout(); }}>
                  <LogOut size={14} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className="nav-btn active"
          onClick={onToggleLang}
          title="Toggle language"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Globe size={16} />
          <span>{lang === 'hi-IN' ? 'हि / EN' : 'EN / हि'}</span>
        </motion.button>

        <motion.button
          className="nav-btn"
          onClick={onOpenHistory}
          title="Query history"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <History size={16} />
          <span>History</span>
        </motion.button>

        <motion.button
          className="nav-btn danger"
          onClick={onLogout}
          title="Sign out"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={16} />
          <span>Exit</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
