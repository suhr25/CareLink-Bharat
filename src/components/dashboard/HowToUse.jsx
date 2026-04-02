import { motion } from 'framer-motion';
import { Mic, Search, ListChecks, CheckCircle2, Monitor, Volume2 } from 'lucide-react';

const steps = [
    {
        icon: <Search size={28} />,
        title: 'Ask Your Question',
        description: 'Type your question in the search box or tap the microphone icon to speak your query in English or Hindi.',
        color: 'var(--primary)',
        bgGrad: 'linear-gradient(135deg, rgba(86, 200, 216, 0.12), rgba(86, 200, 216, 0.04))',
    },
    {
        icon: <ListChecks size={28} />,
        title: 'Follow Step-by-Step',
        description: 'Our AI breaks down your task into simple, numbered steps. Each step is read aloud to guide you through.',
        color: 'var(--purple)',
        bgGrad: 'linear-gradient(135deg, rgba(123, 104, 238, 0.12), rgba(123, 104, 238, 0.04))',
    },
    {
        icon: <Volume2 size={28} />,
        title: 'Listen & Repeat',
        description: 'Every step is spoken aloud. Use the voice controls to pause, resume, or repeat any step at your own pace.',
        color: 'var(--accent)',
        bgGrad: 'linear-gradient(135deg, rgba(240, 160, 80, 0.12), rgba(240, 160, 80, 0.04))',
    },
    {
        icon: <Monitor size={28} />,
        title: 'Verify Your Screen',
        description: 'Share your screen and our AI will capture what you see, analyze it, and confirm if you\'re on track.',
        color: 'var(--emerald)',
        bgGrad: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(52, 211, 153, 0.04))',
    },
    {
        icon: <CheckCircle2 size={28} />,
        title: 'Mark Complete',
        description: 'Tap "Done" on each step as you finish it. Track your progress and celebrate when you\'re all done!',
        color: 'var(--primary-light)',
        bgGrad: 'linear-gradient(135deg, rgba(126, 220, 232, 0.12), rgba(126, 220, 232, 0.04))',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HowToUse() {
    return (
        <motion.section
            className="how-to-use"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={containerVariants}
        >
            <motion.div className="htu-header" variants={cardVariants}>
                <span className="htu-badge">Getting Started</span>
                <h2>How to Use CareLink Bharat</h2>
                <p>Five simple steps to get voice-guided digital assistance</p>
            </motion.div>

            <div className="htu-grid">
                {steps.map((step, i) => (
                    <motion.div
                        key={i}
                        className="htu-card"
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    >
                        <div className="htu-card-number">{i + 1}</div>
                        <div className="htu-card-icon" style={{ background: step.bgGrad, color: step.color }}>
                            {step.icon}
                        </div>
                        <h3 style={{ color: step.color }}>{step.title}</h3>
                        <p>{step.description}</p>
                        {i < steps.length - 1 && <div className="htu-connector" />}
                    </motion.div>
                ))}
            </div>

            <motion.div className="htu-tip" variants={cardVariants}>
                <Mic size={18} />
                <span><strong>Pro tip:</strong> Say "Hey CareLink" followed by your question for the fastest experience!</span>
            </motion.div>
        </motion.section>
    );
}
