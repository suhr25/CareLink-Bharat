(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const queryInput = $('queryInput');
    const queryBox = $('queryBox');
    const micBtn = $('micBtn');
    const submitBtn = $('submitBtn');
    const micStatus = $('micStatus');
    const queryHint = $('queryHint');
    const emptyState = $('emptyState');
    const loadingState = $('loadingState');
    const stepsSection = $('stepsSection');
    const celebration = $('celebration');
    const progressSec = $('progressSection');
    const voiceCtrl = $('voiceControls');
    const langToggle = $('langToggle');
    const fontToggle = $('fontToggle');
    const speedSlider = $('speedSlider');

    let isListening = false;
    let currentLanguage = 'en-IN';
    let fontEnlarged = false;

    // GROQ API KEY
    const GROQ_API_KEY = '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';

    // SPEECH SYNTHESIS (VOICE OUT)
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    function speakText(text) {
        synth.cancel();
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = currentLanguage;
        currentUtterance.rate = parseFloat(speedSlider.value);
        synth.speak(currentUtterance);
    }

    $('pauseBtn').onclick = () => synth.pause();
    $('resumeBtn').onclick = () => synth.resume();
    $('stopBtn').onclick = () => synth.cancel();

    // SPEECH RECOGNITION (VOICE IN)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLanguage;

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            queryBox.classList.add('listening-active');
            setStatus('🔴 Listening… Speak now', 'listening-text');
            queryHint.style.display = 'none';
        };

        recognition.onresult = (event) => {
            let interim = '', final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t;
                else interim += t;
            }
            queryInput.value = final || interim;
        };

        recognition.onerror = () => {
            stopListeningUI();
            setStatus('Microphone error. Try again.', 'error-text');
        };

        recognition.onend = () => stopListeningUI();
    }

    function stopListeningUI() {
        isListening = false;
        micBtn.classList.remove('listening');
        queryBox.classList.remove('listening-active');
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) return setStatus('Voice not supported.', 'error-text');
        if (isListening) recognition.stop();
        else {
            queryInput.value = '';
            recognition.lang = currentLanguage;
            recognition.start();
        }
    });

    async function fetchSteps(query) {
        const isHindi = currentLanguage === 'hi-IN';
        const systemPrompt = `You are CareLink Bharat. Return ONLY a JSON array of step strings. No markdown.
      - 5-8 simple steps max.
      - ${isHindi ? 'Language: Hindi' : 'Language: English'}.
      Example: ["Open WhatsApp.", "Tap Chat."]`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.2
                })
            });

            const data = await response.json();
            const content = data.choices[0].message.content;
            const steps = JSON.parse(content.match(/\[.*\]/s)[0]);
            renderSteps(query, steps);
        } catch (err) {
            console.error(err);
            loadingState.classList.remove('visible');
            emptyState.classList.remove('hidden');
            setStatus('❌ Request failed. Try again.', 'error-text');
        }
    }

    function renderSteps(query, steps) {
        loadingState.classList.remove('visible');
        $('stepsTitleText').textContent = query;
        const container = $('stepsContainer');
        container.innerHTML = '';

        steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'step-card';
            card.style.opacity = '0';
            card.innerHTML = `
          <div class="step-number">${i + 1}</div>
          <div class="step-body">
            <p class="step-text">${step}</p>
            <div class="step-actions" style="display:none;">
              <button class="done-btn" onclick="window._clMarkDone(${i})">Done ✓</button>
              <button class="repeat-btn" onclick="window._clSpeakStep(${i})">🔊 Repeat</button>
            </div>
          </div>
        `;
            container.appendChild(card);
        });

        stepsSection.classList.add('visible');
        progressSec.classList.add('visible');
        voiceCtrl.classList.add('visible');
        window._clSteps = steps;

        anime({
            targets: '.step-card',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            easing: 'easeOutExpo',
            complete: () => {
                activateStep(0);
            }
        });

        updateProgress(0, steps.length);
    }

    function activateStep(idx) {
        const cards = document.querySelectorAll('.step-card');
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === idx);
            const actions = card.querySelector('.step-actions');
            if (actions) actions.style.display = i === idx ? 'flex' : 'none';
            if (i === idx) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                speakText(window._clSteps[idx]);
            }
        });
    }

    window._clMarkDone = function (idx) {
        const cards = document.querySelectorAll('.step-card');
        cards[idx].classList.replace('active', 'done');
        cards[idx].querySelector('.step-number').textContent = '✓';
        const next = idx + 1;
        updateProgress(next, window._clSteps.length);
        if (next < window._clSteps.length) activateStep(next);
        else {
            stepsSection.classList.remove('visible');
            progressSec.classList.remove('visible');
            voiceCtrl.classList.remove('visible');
            celebration.classList.add('visible');
            speakText("Congratulations! You have completed all steps.");
        }
    };

    window._clSpeakStep = function (idx) {
        speakText(window._clSteps[idx]);
    };

    function updateProgress(done, total) {
        $('progressCount').textContent = `${done} of ${total} steps done`;
        $('progressFill').style.width = `${(done / total) * 100}%`;
    }

    function setStatus(text, cls) {
        micStatus.textContent = text;
        micStatus.className = 'mic-status ' + (cls || '');
    }

    submitBtn.addEventListener('click', () => {
        const q = queryInput.value.trim();
        if (!q) return setStatus('Please enter a query.', 'error-text');
        emptyState.classList.add('hidden');
        loadingState.classList.add('visible');
        fetchSteps(q);
    });

    langToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
        langToggle.textContent = currentLanguage === 'en-IN' ? 'EN / हि' : 'हि / EN';
        if (recognition) recognition.lang = currentLanguage;
    });

    fontToggle.addEventListener('click', () => {
        fontEnlarged = !fontEnlarged;
        document.documentElement.style.fontSize = fontEnlarged ? '22px' : '';
        fontToggle.textContent = fontEnlarged ? 'Aa−' : 'Aa+';
    });

    $('newQueryBtn').addEventListener('click', () => location.reload());

    document.querySelectorAll('.example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            queryInput.value = chip.dataset.query;
            submitBtn.click();
        });
    });

})();
