import { motion } from 'framer-motion';
import { ListChecks, Pause, Play, Square } from 'lucide-react';
import StepCard from './StepCard';

export default function StepsSection({
    query,
    steps,
    progress,
    onMarkDone,
    onRepeat,
    onVerify,
    verifying,
    verifyResult,
    pitch,
    onPitchChange,
    onPause,
    onResume,
    onStop,
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Progress bar */}
            <motion.section
                className="progress-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="progress-header">
                    <span className="progress-label">Your Progress</span>
                    <span className="progress-count">{progress} of {steps.length} steps done</span>
                </div>
                <div className="progress-track">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / steps.length) * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
            </motion.section>

            {/* Voice controls */}
            <motion.div
                className="voice-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <button className="voice-ctrl-btn" onClick={onPause}>
                    <Pause size={15} /> Pause
                </button>
                <button className="voice-ctrl-btn" onClick={onResume}>
                    <Play size={15} /> Resume
                </button>
                <button className="voice-ctrl-btn" onClick={onStop}>
                    <Square size={15} /> Stop
                </button>
                <input
                    type="range"
                    className="speed-slider"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={e => onPitchChange(parseFloat(e.target.value))}
                    title={`Speed: ${pitch}x`}
                />
            </motion.div>

            {/* Steps */}
            <section className="steps-section">
                <div className="steps-title">
                    <ListChecks size={22} />
                    {query}
                </div>

                {steps.map((step, i) => (
                    <StepCard
                        key={i}
                        step={step}
                        index={i}
                        progress={progress}
                        isActive={i === progress}
                        isDone={i < progress}
                        isLocked={i > progress}
                        onMarkDone={() => onMarkDone(i)}
                        onRepeat={() => onRepeat(step)}
                        onVerify={() => onVerify(step)}
                        verifying={verifying && i === progress}
                        verifyResult={i === progress ? verifyResult : ''}
                    />
                ))}
            </section>
        </motion.div>
    );
}
