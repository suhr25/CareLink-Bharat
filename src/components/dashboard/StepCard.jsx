import { motion } from 'framer-motion';
import { Check, Volume2, Monitor, Loader2 } from 'lucide-react';

export default function StepCard({
    step,
    index,
    progress,
    isActive,
    isDone,
    isLocked,
    onMarkDone,
    onRepeat,
    onVerify,
    verifying,
    verifyResult,
}) {
    return (
        <motion.div
            className={`step-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={!isLocked ? { y: -2, transition: { duration: 0.2 } } : {}}
        >
            <motion.div
                className="step-number"
                animate={isActive ? {
                    boxShadow: [
                        '0 0 20px rgba(123, 104, 238, 0.3)',
                        '0 0 30px rgba(123, 104, 238, 0.5)',
                        '0 0 20px rgba(123, 104, 238, 0.3)',
                    ]
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                {isDone ? <Check size={18} /> : index + 1}
            </motion.div>

            <div className="step-body">
                <p className="step-text">{step}</p>

                {isActive && (
                    <motion.div
                        className="step-actions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <motion.button
                            className="step-btn done-btn"
                            onClick={onMarkDone}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Check size={15} />
                            Done
                        </motion.button>

                        <motion.button
                            className="step-btn repeat-btn"
                            onClick={onRepeat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Volume2 size={15} />
                            Repeat
                        </motion.button>

                        <motion.button
                            className="step-btn verify-btn"
                            onClick={onVerify}
                            disabled={verifying}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {verifying ? (
                                <><Loader2 size={15} className="spin" /> Verifying...</>
                            ) : (
                                <><Monitor size={15} /> Verify Screen</>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {isActive && verifyResult && (
                    <motion.div
                        className="verify-result"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {verifyResult}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
