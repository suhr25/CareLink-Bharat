import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export default function HeroSection() {
    return (
        <motion.section
            className="hero"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
            <motion.div
                className="hero-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
                <Mic size={16} />
                Voice-Guided Assistance
            </motion.div>

            <h1>
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Need help with something?
                </motion.span>
                <br />
                <motion.span
                    className="hero-gradient-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                >
                    Just ask. We'll guide you.
                </motion.span>
            </h1>
        </motion.section>
    );
}
