import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, X } from 'lucide-react';

export default function HistoryPanel({ isOpen, history, onSelect, onClear, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="history-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="history-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="history-header">
                            <h3>
                                <History size={20} />
                                Query History
                            </h3>
                            <div className="history-actions">
                                <button className="history-clear-btn" onClick={onClear}>
                                    <Trash2 size={13} />
                                    Clear
                                </button>
                                <button className="history-close-btn" onClick={onClose}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="history-list">
                            {history.length === 0 ? (
                                <div className="history-empty">No queries yet. Start asking!</div>
                            ) : (
                                history.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="history-item"
                                        onClick={() => onSelect(h.query)}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.3 }}
                                        whileHover={{ x: -4 }}
                                    >
                                        <span className="history-query">{h.query}</span>
                                        <span className="history-time">{h.time}</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
