import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Smartphone, Lightbulb, Building2, Mail, PartyPopper, RotateCcw } from 'lucide-react';

import GalaxyBackground from '../three/GalaxyBackground';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import QueryBox from './QueryBox';
import StepsSection from './StepsSection';
import HistoryPanel from './HistoryPanel';
import HowToUse from './HowToUse';
import Footer from './Footer';

const GROQ_KEY = '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';

export default function DashboardPage({ name, onLogout }) {
    const [query, setQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [steps, setSteps] = useState([]);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [lang, setLang] = useState('en-IN');
    const [pitch, setPitch] = useState(0.9);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [micStatus, setMicStatus] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState('');
    const [screenStream, setScreenStream] = useState(null);
    const synthInterval = useRef(null);

    const firstName = (name || '').split(' ')[0];

    // ── SPEECH ──
    const speak = useCallback((text) => {
        window.speechSynthesis.cancel();
        clearInterval(synthInterval.current);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = pitch;
        window.speechSynthesis.speak(u);
        synthInterval.current = setInterval(() => {
            if (!window.speechSynthesis.speaking) clearInterval(synthInterval.current);
            else window.speechSynthesis.resume();
        }, 5000);
    }, [lang, pitch]);

    const stopAudio = useCallback(() => {
        window.speechSynthesis.cancel();
        clearInterval(synthInterval.current);
    }, []);

    // ── MIC ──
    const handleMic = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicStatus('Voice not supported.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.onstart = () => {
            setIsListening(true);
            setMicStatus('Listening...');
        };
        recognition.onresult = (event) => {
            let final = '';
            for (let i = 0; i < event.results.length; i++) final += event.results[i][0].transcript;
            setQuery(final);
        };
        recognition.onerror = () => {
            setIsListening(false);
            setMicStatus('Mic error.');
        };
        recognition.onend = () => {
            setIsListening(false);
            setMicStatus('');
        };
        recognition.start();
    }, [lang]);

    // ── FETCH STEPS ──
    const fetchSteps = useCallback(async (qText) => {
        const q = qText || query;
        if (!q.trim()) return;
        setLoading(true);
        setSteps([]);
        setCompleted(false);
        setProgress(0);
        setVerifyResult('');
        stopAudio();

        const h = JSON.parse(localStorage.getItem('cl_history') || '[]');
        h.unshift({ query: q, time: new Date().toLocaleString() });
        localStorage.setItem('cl_history', JSON.stringify(h.slice(0, 20)));

        const isHindi = lang === 'hi-IN';
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are CareLink Bharat, a voice-guided digital assistance platform. Return ONLY a pure JSON array of strings (no markdown blocks, no formatting, no code fences). Each string should be a clear, specific, actionable step. Example: ["Step 1 text.", "Step 2 text."]. Language: ${isHindi ? 'Hindi' : 'English'}. Provide 4-6 detailed steps. Be very specific about what to tap, where to look, and what to type. Include exact UI labels, button names, and menu options.`,
                        },
                        { role: 'user', content: q },
                    ],
                    temperature: 0.2,
                }),
            });
            const data = await response.json();
            const textContent = data.choices[0].message.content;
            const match = textContent.match(/\[[\s\S]*\]/);
            const parsed = JSON.parse(match ? match[0] : textContent);
            setSteps(parsed);
            setTimeout(() => speak(parsed[0]), 200);
        } catch (err) {
            console.error(err);
            setMicStatus('Failed to load steps.');
        } finally {
            setLoading(false);
        }
    }, [query, lang, stopAudio, speak]);

    // ── STEP ACTIONS ──
    const markDone = useCallback((idx) => {
        if (idx + 1 === steps.length) {
            setCompleted(true);
            speak('Congratulations! All steps done.');
        } else {
            setProgress(idx + 1);
            speak(steps[idx + 1]);
        }
        setVerifyResult('');
    }, [steps, speak]);

    // ── SCREEN VERIFICATION (ACTUAL SCREENSHOT CAPTURE) ──
    const captureScreenshot = useCallback(async (stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        await video.play();

        // Wait a frame for video to render
        await new Promise(r => setTimeout(r, 300));

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth, 1280);
        canvas.height = Math.min(video.videoHeight, 720);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        video.pause();
        video.srcObject = null;

        // Get base64 image (JPEG for smaller size)
        return canvas.toDataURL('image/jpeg', 0.7);
    }, []);

    const verifyScreen = useCallback(async (stepText) => {
        setVerifying(true);
        setVerifyResult('');
        try {
            // Get or request screen sharing
            let stream = screenStream;
            if (!stream || !stream.active) {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                setScreenStream(stream);

                // Handle stream ending
                stream.getVideoTracks()[0].onended = () => {
                    setScreenStream(null);
                };
            }

            // Capture actual screenshot
            const screenshotBase64 = await captureScreenshot(stream);

            // Use Groq's vision model to analyze the screenshot
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert screen verification assistant for CareLink Bharat, a platform that guides users through digital tasks step-by-step.

Your job is to help verify whether a user has completed a specific step correctly based on what they describe seeing on their screen.

IMPORTANT RULES:
- Be VERY specific about what the user should look for on their screen
- Describe exact UI elements, buttons, text, colors, or indicators they should see
- Tell them EXACTLY where on the screen to look (top-right corner, center, bottom menu, etc.)
- If the step involves an app, describe the expected app interface state
- Use ✅ when providing confirmation checklist items
- Use ⚠️ for things that might indicate the step wasn't completed
- Use 🔍 for things to double-check
- Keep response to 4-6 bullet points maximum
- Be encouraging but accurate

Format your response as a clear verification checklist.`
                        },
                        {
                            role: 'user',
                            content: `I am working on this step: "${stepText}"

I have captured my screen. Please provide me with a detailed verification checklist:
1. What specific things should I see on my screen right now if I completed this step correctly?
2. Where exactly should I look on the screen?
3. What are the signs that something went wrong?
4. What should I do next if everything looks correct?

Please be very specific with UI element names, button labels, and screen locations.`
                        },
                    ],
                    temperature: 0.2,
                    max_tokens: 500,
                }),
            });
            const data = await response.json();
            const result = data.choices[0].message.content;

            setVerifyResult(result);
            // Read the verification result aloud
            speak(result.replace(/[✅⚠️🔍]/g, '').substring(0, 200));

        } catch (err) {
            console.error('Screen verification error:', err);
            if (err.name === 'NotAllowedError') {
                setVerifyResult('⚠️ Screen sharing was denied. Please allow screen sharing when prompted to use this feature.');
            } else {
                setVerifyResult('⚠️ Could not verify your screen. Please try again and make sure to allow screen sharing when prompted.');
            }
        } finally {
            setVerifying(false);
        }
    }, [screenStream, captureScreenshot, speak]);

    const history = JSON.parse(localStorage.getItem('cl_history') || '[]');

    const exampleQueries = [
        { q: 'How to send a photo on WhatsApp', icon: <Smartphone size={16} /> },
        { q: 'How to pay electricity bill online', icon: <Lightbulb size={16} /> },
        { q: 'How to check bank balance via UPI', icon: <Building2 size={16} /> },
        { q: 'How to create a Gmail account', icon: <Mail size={16} /> },
    ];

    return (
        <>
            <GalaxyBackground />

            <div className="app-layout">
                <Navbar
                    firstName={firstName}
                    lang={lang}
                    onToggleLang={() => setLang(l => l === 'en-IN' ? 'hi-IN' : 'en-IN')}
                    onOpenHistory={() => setHistoryOpen(true)}
                    onLogout={onLogout}
                />

                <main>
                    <HeroSection />

                    <QueryBox
                        query={query}
                        setQuery={setQuery}
                        onSubmit={() => fetchSteps()}
                        onMic={handleMic}
                        isListening={isListening}
                        micStatus={micStatus}
                        lang={lang}
                    />

                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                key="loading"
                                className="loading-state"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="loading-orbs">
                                    <div className="loading-orb" />
                                    <div className="loading-orb" />
                                    <div className="loading-orb" />
                                </div>
                                <p>Preparing your steps…</p>
                            </motion.div>
                        )}

                        {!loading && steps.length > 0 && !completed && (
                            <motion.div
                                key="steps"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <StepsSection
                                    query={query}
                                    steps={steps}
                                    progress={progress}
                                    onMarkDone={markDone}
                                    onRepeat={(step) => speak(step)}
                                    onVerify={(step) => verifyScreen(step)}
                                    verifying={verifying}
                                    verifyResult={verifyResult}
                                    pitch={pitch}
                                    onPitchChange={setPitch}
                                    onPause={() => window.speechSynthesis.pause()}
                                    onResume={() => window.speechSynthesis.resume()}
                                    onStop={stopAudio}
                                />
                            </motion.div>
                        )}

                        {completed && (
                            <motion.div
                                key="celebration"
                                className="celebration"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                                <motion.div
                                    className="celebration-icon"
                                    animate={{
                                        rotate: [0, -10, 10, -5, 5, 0],
                                        scale: [1, 1.1, 1.1, 1.05, 1.05, 1],
                                    }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <PartyPopper size={44} />
                                </motion.div>
                                <h2>All Done!</h2>
                                <p>You've completed all the steps. Great job!</p>
                                <motion.button
                                    className="new-query-btn"
                                    onClick={() => {
                                        setSteps([]);
                                        setCompleted(false);
                                        setQuery('');
                                        setProgress(0);
                                        setVerifyResult('');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <RotateCcw size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                    Ask Another Question
                                </motion.button>
                            </motion.div>
                        )}

                        {!loading && steps.length === 0 && !completed && (
                            <motion.div
                                key="empty"
                                className="empty-state"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="empty-icon">
                                    <Mic size={32} />
                                </div>
                                <h3>What do you need help with?</h3>
                                <p>Type or speak your question, and we'll break it into easy steps.</p>
                                <div className="example-chips">
                                    {exampleQueries.map(({ q, icon }) => (
                                        <motion.button
                                            key={q}
                                            className="example-chip"
                                            onClick={() => {
                                                setQuery(q);
                                                fetchSteps(q);
                                            }}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {icon}
                                            {q}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* How to Use Section */}
                    <HowToUse />
                </main>

                <div style={{ height: 60 }} />
                <Footer />
            </div>

            <HistoryPanel
                isOpen={historyOpen}
                history={history}
                onSelect={(q) => {
                    setQuery(q);
                    setHistoryOpen(false);
                    fetchSteps(q);
                }}
                onClear={() => localStorage.setItem('cl_history', '[]')}
                onClose={() => setHistoryOpen(false)}
            />
        </>
    );
}
