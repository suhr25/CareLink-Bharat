import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <motion.footer
            className="app-footer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="footer-brand">
                <span className="primary">CareLink</span>
                {' '}
                <span className="accent">Bharat</span>
            </div>

            <p className="footer-desc">
                CareLink Bharat is a voice-guided digital assistance platform that helps users
                navigate everyday tasks — from paying bills to sending messages — with simple,
                step-by-step instructions read aloud in their language.
            </p>

            <div className="footer-credits">
                Made by <strong>Ashnaa Seth</strong> & <strong>Suhrid Marwah</strong>
            </div>

            <div className="footer-copy">
                © 2026 CareLink Bharat · Helping India go digital.
            </div>
        </motion.footer>
    );
}
