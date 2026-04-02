import { motion } from 'framer-motion';
import { Mic, Send } from 'lucide-react';

export default function QueryBox({ query, setQuery, onSubmit, onMic, isListening, micStatus, lang }) {
    return (
        <motion.section
            className="query-section"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className={`query-box ${isListening ? 'listening' : ''}`}>
                <input
                    id="query-input"
                    className="query-input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSubmit()}
                    placeholder={lang === 'hi-IN'
                        ? 'कुछ भी पूछें…'
                        : "Ask anything… e.g. 'How to send a WhatsApp photo?'"
                    }
                />

                <motion.button
                    className={`query-action-btn mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={onMic}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    title="Voice input"
                    id="mic-button"
                >
                    <Mic size={22} />
                </motion.button>

                <motion.button
                    className="query-action-btn send-btn"
                    onClick={onSubmit}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    title="Submit query"
                    id="submit-button"
                >
                    <Send size={20} />
                </motion.button>
            </div>

            {micStatus && (
                <motion.div
                    className={`mic-status ${isListening ? 'listening' : 'error'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {micStatus}
                </motion.div>
            )}
        </motion.section>
    );
}
