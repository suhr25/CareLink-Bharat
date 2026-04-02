import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onComplete }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onComplete?.(), 500);
        }, 1800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <motion.div
                        className="preloader-ring"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="preloader-ring-circle" />
                        <div className="preloader-ring-circle" />
                        <div className="preloader-ring-circle" />
                    </motion.div>

                    <motion.div
                        className="preloader-brand"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <span className="preloader-brand-care">CareLink </span>
                        <span className="preloader-brand-bharat">Bharat</span>
                    </motion.div>

                    <div className="preloader-dots">
                        <div className="preloader-dot" />
                        <div className="preloader-dot" />
                        <div className="preloader-dot" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
