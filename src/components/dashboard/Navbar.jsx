import { motion } from 'framer-motion';
import { User, Globe, History, LogOut, Zap } from 'lucide-react';

export default function Navbar({ firstName, lang, onToggleLang, onOpenHistory, onLogout }) {
    return (
        <motion.nav
            className="navbar"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Logo with icon */}
            <div className="nav-logo-group">
                <motion.div
                    className="nav-logo-icon"
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Zap size={20} />
                </motion.div>
                <div className="nav-logo">
                    <span className="primary">CareLink</span>
                    {' '}
                    <span className="accent">Bharat</span>
                </div>
            </div>

            {/* Actions */}
            <div className="nav-actions">
                <motion.div
                    className="nav-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <div className="nav-chip-avatar">
                        <User />
                    </div>
                    <span className="nav-chip-name">{firstName}</span>
                </motion.div>

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
