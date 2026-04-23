import { useState, useRef, useCallback, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function DashboardPage({ onLogout }) {
    const { user } = useAuth();
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

    // ── HISTORY (from backend) ──
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get('/query/history')
            .then(({ data }) => setHistory(data.data.history.map(h => ({ query: h.query, time: new Date(h.createdAt).toLocaleString() }))))
            .catch(() => {});
    }, []);

    // ── FETCH STEPS (via backend — saves to MongoDB automatically) ──
    const fetchSteps = useCallback(async (qText) => {
        const q = qText || query;
        if (!q.trim()) return;
        setLoading(true);
        setSteps([]);
        setCompleted(false);
        setProgress(0);
        setVerifyResult('');
        stopAudio();

        try {
            const { data } = await api.post('/query/ask', { query: q, language: lang });
            const parsed = data.data.steps;
            setSteps(parsed);
            setHistory(prev => [{ query: q, time: new Date().toLocaleString() }, ...prev.slice(0, 19)]);
            setTimeout(() => speak(parsed[0]), 200);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '';
            setMicStatus(msg.includes('quota') || msg.includes('rate') ? 'Rate limited. Please wait a moment and try again.' : 'Failed to load steps.');
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

            const { data } = await api.post('/query/verify', { stepText });
            const result = data.data.verification;

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
                    user={user}
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
                onClear={() => {
                        api.delete('/query/history').catch(() => {});
                        setHistory([]);
                    }}
                onClose={() => setHistoryOpen(false)}
            />
        </>
    );
}
