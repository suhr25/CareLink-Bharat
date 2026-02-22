// ═══════════════════════════════════════════════════════════════════════════
//  CareLink Bharat — Unified Script
//  Sections:
//    1. User Auth Store
//    2. Three.js Login Scene
//    3. Login / Signup Logic
//    4. App Init (boot decides login or main)
//    5. Three.js Main Scene (scroll-reactive waves, rings, etc.)
//    6. Main App Logic (voice, steps, history, etc.)
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ── 1. USER AUTH STORE ──────────────────────────────────────────────────────
function getUsers() {
    try { return JSON.parse(localStorage.getItem('cl_users') || '[]'); }
    catch { return []; }
}
function saveUsers(users) { localStorage.setItem('cl_users', JSON.stringify(users)); }

// Seed built-in accounts on first ever load
(function seedDefaults() {
    if (!getUsers().length) {
        saveUsers([
            { name: 'Admin', username: 'admin', password: 'carelink2026' },
            { name: 'Suhrid Marwah', username: 'suhrid', password: 'pstoJT@2026' },
            { name: 'Ashnaa Seth', username: 'ashnaa', password: 'pstoJT@2026' },
        ]);
    }
})();

// ── 2. THREE.JS LOGIN SCENE ─────────────────────────────────────────────────
let loginRenderer = null;

function startLoginScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 300);

    loginRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    loginRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    loginRenderer.setSize(window.innerWidth, window.innerHeight);
    loginRenderer.domElement.id = 'loginCanvas';
    document.getElementById('loginScreen').prepend(loginRenderer.domElement);

    const mouse = { x: 0, y: 0 };
    const ms = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── Grid ──
    const gridGeo = new THREE.PlaneGeometry(1400, 900, 60, 40);
    gridGeo.rotateX(-Math.PI * 0.3);
    const grid = new THREE.Mesh(gridGeo, new THREE.MeshBasicMaterial({
        color: 0x56C8D8, wireframe: true, transparent: true, opacity: 0.04,
    }));
    grid.position.set(0, -150, -100);
    scene.add(grid);

    const gridGeo2 = new THREE.PlaneGeometry(1400, 900, 30, 20);
    gridGeo2.rotateX(-Math.PI * 0.3);
    const grid2 = new THREE.Mesh(gridGeo2, new THREE.MeshBasicMaterial({
        color: 0x7B68EE, wireframe: true, transparent: true, opacity: 0.025,
    }));
    grid2.position.set(0, -100, -150);
    scene.add(grid2);

    // ── Rings ──
    function makeRing(r, tube, color, x, y, z) {
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: false, transparent: true, opacity: 0 });
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 120), mat);
        m.position.set(x, y, z);
        scene.add(m);
        return { m, mat };
    }
    const rings = [
        makeRing(90, 0.9, 0x56C8D8, 0, 0, -80),
        makeRing(130, 0.6, 0x7B68EE, 0, 0, -120),
        makeRing(60, 0.7, 0xF0A050, -60, 30, -60),
        makeRing(45, 0.5, 0x56C8D8, 80, -40, -40),
    ];
    const ringTargets = [0.12, 0.07, 0.10, 0.08];
    function fadeIn(mat, target, dur, delay) {
        setTimeout(() => {
            const s = performance.now();
            function step(now) {
                mat.opacity = Math.min((now - s) / dur, 1) * target;
                if (mat.opacity < target) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }, delay);
    }
    rings.forEach(({ mat }, i) => fadeIn(mat, ringTargets[i], 1200, 300 + i * 200));

    // ── Central icosahedron ──
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x56C8D8, wireframe: true, transparent: true, opacity: 0 });
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(28, 1), icoMat);
    scene.add(ico);
    fadeIn(icoMat, 0.14, 1400, 200);

    // ── Satellite octahedra ──
    function makeOcta(size, color, x, y, z) {
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0 });
        const m = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), mat);
        m.position.set(x, y, z);
        scene.add(m);
        return { m, mat };
    }
    const octa1 = makeOcta(12, 0xF0A050, -110, 50, -20);
    const octa2 = makeOcta(9, 0x7B68EE, 130, -60, -30);
    const octa3 = makeOcta(7, 0x56C8D8, 60, 80, -10);
    fadeIn(octa1.mat, 0.18, 1200, 600);
    fadeIn(octa2.mat, 0.15, 1200, 800);
    fadeIn(octa3.mat, 0.12, 1000, 500);

    // ── Stars ──
    const N = 120, sPos = new Float32Array(N * 3), sCol = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * 800;
        sPos[i * 3 + 1] = (Math.random() - 0.5) * 500;
        sPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
        const r = Math.random();
        if (r > 0.6) { sCol[i * 3] = 0.34; sCol[i * 3 + 1] = 0.78; sCol[i * 3 + 2] = 0.85; }
        else if (r > 0.3) { sCol[i * 3] = 0.48; sCol[i * 3 + 1] = 0.41; sCol[i * 3 + 2] = 0.93; }
        else { sCol[i * 3] = 0.94; sCol[i * 3 + 1] = 0.63; sCol[i * 3 + 2] = 0.31; }
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── Connection lines ──
    function makeLine(a, b, c) {
        const mat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.07 });
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), mat));
        return mat;
    }
    const lineMats = [
        makeLine([0, 0, 0], [-110, 50, -20], 0x56C8D8),
        makeLine([0, 0, 0], [130, -60, -30], 0x7B68EE),
        makeLine([0, 0, 0], [60, 80, -10], 0x56C8D8),
        makeLine([-110, 50, -20], [60, 80, -10], 0xF0A050),
        makeLine([130, -60, -30], [60, 80, -10], 0x7B68EE),
    ];

    const clock = new THREE.Clock();
    let loginAnimating = true;

    function loginAnimate() {
        if (!loginAnimating) return;
        requestAnimationFrame(loginAnimate);
        const t = clock.getElapsedTime();
        ms.x += (mouse.x - ms.x) * 0.05;
        ms.y += (mouse.y - ms.y) * 0.05;
        camera.position.x = ms.x * 18;
        camera.position.y = ms.y * -12 + Math.sin(t * 0.3) * 4;
        camera.lookAt(0, 0, 0);

        const gv = gridGeo.attributes.position.array;
        for (let i = 0; i <= 60; i++) for (let j = 0; j <= 40; j++) {
            const idx = (i * 41 + j) * 3;
            gv[idx + 1] = Math.sin(gv[idx] * 0.009 + t * 0.4) * 12 + Math.cos(gv[idx + 2] * 0.008 + t * 0.3) * 8;
        }
        gridGeo.attributes.position.needsUpdate = true;

        rings[0].m.rotation.set(t * 0.22 + ms.y * 0.3, t * 0.17 + ms.x * 0.3, 0);
        rings[1].m.rotation.set(-t * 0.15, 0, t * 0.12 + ms.x * 0.2);
        rings[2].m.rotation.set(-t * 0.2, t * 0.3, 0);
        rings[2].m.position.y = 30 + Math.sin(t * 0.7) * 8;
        rings[3].m.rotation.set(t * 0.25, 0, t * 0.4);
        rings[3].m.position.y = -40 + Math.cos(t * 0.8) * 6;

        ico.rotation.set(t * 0.18, t * 0.26 + ms.x * 0.15, 0);
        ico.scale.setScalar(1 + Math.sin(t * 0.5) * 0.06);

        octa1.m.rotation.set(t * 0.35 + ms.y * 0.2, t * 0.5, 0);
        octa1.m.position.x = -110 + Math.sin(t * 0.4) * 12;
        octa1.m.position.y = 50 + Math.cos(t * 0.6) * 8;
        octa2.m.rotation.set(0, -t * 0.45, t * 0.3);
        octa2.m.position.x = 130 + Math.sin(t * 0.5 + 1) * 10;
        octa2.m.position.y = -60 + Math.cos(t * 0.4 + 2) * 7;
        octa3.m.rotation.set(t * 0.6, 0, -t * 0.4);
        octa3.m.position.y = 80 + Math.sin(t * 0.8) * 5;

        lineMats.forEach((m, i) => { m.opacity = 0.04 + Math.sin(t * 0.5 + i) * 0.04; });
        stars.rotation.set(t * 0.004, t * 0.008, 0);
        starMat.opacity = 0.28 + Math.sin(t * 0.4) * 0.06;

        loginRenderer.render(scene, camera);
    }
    loginAnimate();

    window.addEventListener('resize', () => {
        if (!loginRenderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        loginRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => { loginAnimating = false; };
}

// ── 3. LOGIN / SIGNUP LOGIC ─────────────────────────────────────────────────
function initAuthUI(onSuccess) {
    const loginCardEl = document.getElementById('loginCard');
    const signupCardEl = document.getElementById('signupCard');

    // Panel toggle
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        loginCardEl.classList.add('slide-out-left');
        setTimeout(() => {
            loginCardEl.style.display = 'none';
            loginCardEl.classList.remove('slide-out-left');
            signupCardEl.style.display = 'block';
            signupCardEl.classList.add('slide-in-right');
            setTimeout(() => signupCardEl.classList.remove('slide-in-right'), 400);
        }, 260);
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        signupCardEl.classList.add('slide-out-right');
        setTimeout(() => {
            signupCardEl.style.display = 'none';
            signupCardEl.classList.remove('slide-out-right');
            loginCardEl.style.display = 'block';
            loginCardEl.classList.add('slide-in-left');
            setTimeout(() => loginCardEl.classList.remove('slide-in-left'), 400);
        }, 260);
    });

    // Eye toggle for login password
    const togglePwd = document.getElementById('togglePwd');
    const pwdInput = document.getElementById('password');
    togglePwd.addEventListener('click', () => {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        togglePwd.textContent = pwdInput.type === 'password' ? '👁' : '🙈';
    });

    // Eye toggle for signup password
    const toggleSuPwd = document.getElementById('toggleSuPwd');
    const suPwdInput = document.getElementById('su_password');
    toggleSuPwd.addEventListener('click', () => {
        suPwdInput.type = suPwdInput.type === 'password' ? 'text' : 'password';
        toggleSuPwd.textContent = suPwdInput.type === 'password' ? '👁' : '🙈';
    });

    // Auto-fill remembered user
    const saved = localStorage.getItem('cl_user');
    if (saved) document.getElementById('username').value = saved;

    // Login form
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginBtnTxt = loginForm.querySelector('.btn-text');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMsg(loginError);
        const username = document.getElementById('username').value.trim();
        const password = pwdInput.value;
        if (!username || !password) { showErrMsg(loginError, 'Please fill in all fields.'); return; }
        setLoading(loginBtnTxt, loginSpinner, true);
        await delay(800);
        setLoading(loginBtnTxt, loginSpinner, false);
        const valid = getUsers().find(u => u.username === username && u.password === password);
        if (valid) {
            if (document.getElementById('rememberMe').checked) localStorage.setItem('cl_user', username);
            localStorage.setItem('cl_name', valid.name || valid.username);
            loginCardEl.classList.add('success');
            await delay(500);
            triggerLoginTransition(onSuccess);
        } else {
            showErrMsg(loginError, 'Incorrect username or password.');
            loginCardEl.classList.add('shake');
            setTimeout(() => loginCardEl.classList.remove('shake'), 500);
        }
    });

    // Signup form
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    const signupSpinner = document.getElementById('signupSpinner');
    const signupBtnTxt = signupForm.querySelector('.btn-text');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMsg(signupError); clearMsg(signupSuccess);
        const name = document.getElementById('su_name').value.trim();
        const username = document.getElementById('su_username').value.trim().toLowerCase();
        const password = suPwdInput.value;
        const confirm = document.getElementById('su_confirm').value;
        if (!name || !username || !password || !confirm) { showErrMsg(signupError, 'Please fill in all fields.'); return; }
        if (username.length < 3) { showErrMsg(signupError, 'Username must be at least 3 characters.'); return; }
        if (password.length < 6) { showErrMsg(signupError, 'Password must be at least 6 characters.'); return; }
        if (password !== confirm) {
            showErrMsg(signupError, 'Passwords do not match.');
            signupCardEl.classList.add('shake');
            setTimeout(() => signupCardEl.classList.remove('shake'), 500);
            return;
        }
        if (getUsers().find(u => u.username === username)) { showErrMsg(signupError, 'Username already taken.'); return; }
        setLoading(signupBtnTxt, signupSpinner, true);
        await delay(900);
        setLoading(signupBtnTxt, signupSpinner, false);
        const users = getUsers();
        users.push({ name, username, password });
        saveUsers(users);
        signupSuccess.textContent = `✅ Account created! Welcome, ${name}!`;
        signupSuccess.style.opacity = '1';
        signupSuccess.style.transform = 'translateY(0)';
        localStorage.setItem('cl_user', username);
        localStorage.setItem('cl_name', name);
        await delay(1200);
        signupCardEl.classList.add('success');
        await delay(400);
        triggerLoginTransition(onSuccess);
    });
}

function triggerLoginTransition(onSuccess) {
    const overlay = document.getElementById('pageTransitionOut');
    overlay.classList.add('active');
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        if (loginRenderer) {
            loginRenderer.domElement.remove();
            loginRenderer.dispose();
            loginRenderer = null;
        }
        onSuccess();
    }, 900);
}

// ── SHARED UTILS ────────────────────────────────────────────────────────────
function showErrMsg(el, msg) { el.textContent = msg; el.classList.add('visible'); }
function clearMsg(el) { el.textContent = ''; el.classList.remove('visible'); el.style.opacity = ''; el.style.transform = ''; }
function setLoading(txt, sp, on) { txt.style.display = on ? 'none' : 'inline'; sp.style.display = on ? 'inline' : 'none'; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── 4. BOOT ─────────────────────────────────────────────────────────────────
(function boot() {
    const loggedIn = !!localStorage.getItem('cl_name');

    if (!loggedIn) {
        // Show login screen, hide main app
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        const stopLogin = startLoginScene();
        initAuthUI(() => {
            stopLogin();
            launchMainApp();
        });
    } else {
        // Already authenticated — skip login
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        launchMainApp();
    }
})();

// ── 5. THREE.JS MAIN SCENE ──────────────────────────────────────────────────
function startMainScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 200, 420);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.getElementById('mainApp').prepend(renderer.domElement);

    // Wave mesh helper
    function makeWave(segsX, segsZ, color, opacity) {
        const geo = new THREE.PlaneGeometry(600, 600, segsX, segsZ);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
        const m = new THREE.Mesh(geo, mat);
        m.position.y = -60;
        scene.add(m);
        return { geo, mat, m };
    }
    const wave1 = makeWave(50, 50, 0x56C8D8, 0.10);
    const wave2 = makeWave(30, 30, 0x7B68EE, 0.07);
    const wave3 = makeWave(20, 20, 0xF0A050, 0.00);

    // Ring helper
    function makeMainRing(r, tube, color, opacity) {
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: false, transparent: true, opacity });
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 120), mat);
        scene.add(m);
        return { m, mat };
    }
    const ring1 = makeMainRing(90, 1.2, 0x56C8D8, 0.08);
    const ring2 = makeMainRing(60, 0.8, 0xF0A050, 0.00);

    // Dodecahedron
    const dMat = new THREE.MeshBasicMaterial({ color: 0xF0A050, wireframe: true, transparent: true, opacity: 0.00 });
    const dMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(22, 0), dMat);
    dMesh.position.set(120, 20, -40);
    scene.add(dMesh);

    // Particles
    const PC = 70, pPos = new Float32Array(PC * 3), pCol = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
        const a = Math.random() * Math.PI * 2, r = 80 + Math.random() * 260;
        pPos[i * 3] = Math.cos(a) * r; pPos[i * 3 + 1] = (Math.random() - 0.5) * 160; pPos[i * 3 + 2] = Math.sin(a) * r;
        const c = Math.random();
        if (c > 0.6) { pCol[i * 3] = 0.34; pCol[i * 3 + 1] = 0.78; pCol[i * 3 + 2] = 0.85; }
        else if (c > 0.3) { pCol[i * 3] = 0.48; pCol[i * 3 + 1] = 0.41; pCol[i * 3 + 2] = 0.93; }
        else { pCol[i * 3] = 0.94; pCol[i * 3 + 1] = 0.63; pCol[i * 3 + 2] = 0.31; }
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Scroll state
    let scrollY = 0, scrollTarget = 0;
    const maxScroll = () => (document.getElementById('mainApp').scrollHeight || document.body.scrollHeight) - window.innerHeight;
    document.getElementById('mainApp').addEventListener('scroll', (e) => { scrollTarget = e.target.scrollTop; });
    window.addEventListener('scroll', () => { scrollTarget = window.scrollY; });

    const mouse = { x: 0, y: 0 }, mouseSmooth = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Scroll-reveal for sections
    const revealTargets = document.querySelectorAll('.hero, .query-section, .steps-section, .empty-state, .celebration, .footer');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('scroll-visible'); });
    }, { threshold: 0.15 });
    revealTargets.forEach(el => { el.classList.add('scroll-reveal'); revealObs.observe(el); });

    const clock = new THREE.Clock();

    function mainAnimate() {
        requestAnimationFrame(mainAnimate);
        const t = clock.getElapsedTime();
        scrollY += (scrollTarget - scrollY) * 0.06;
        const sf = scrollY / (maxScroll() || 1);
        mouseSmooth.x += (mouse.x - mouseSmooth.x) * 0.04;
        mouseSmooth.y += (mouse.y - mouseSmooth.y) * 0.04;

        // Animate wave 1
        const v1 = wave1.geo.attributes.position.array;
        for (let i = 0; i < v1.length; i += 3) {
            v1[i + 1] = Math.sin(v1[i] * 0.012 + t * 0.6) * (12 + sf * 20) +
                Math.cos(v1[i + 2] * 0.010 + t * 0.45) * (8 + sf * 14);
        }
        wave1.geo.attributes.position.needsUpdate = true;
        wave1.mat.opacity = 0.10 + sf * 0.06;

        // Animate wave 2
        const v2 = wave2.geo.attributes.position.array;
        for (let i = 0; i < v2.length; i += 3) {
            v2[i + 1] = Math.sin(v2[i] * 0.009 + t * 0.4 + 1) * (10 + sf * 18) +
                Math.cos(v2[i + 2] * 0.008 + t * 0.55 + 2) * (7 + sf * 12);
        }
        wave2.geo.attributes.position.needsUpdate = true;
        wave2.mat.opacity = 0.07 + sf * 0.05;
        wave2.m.position.y = -60 + sf * 20;

        // Amber wave (fades in at 30% scroll)
        wave3.mat.opacity = Math.max(0, (sf - 0.3) / 0.3) * 0.05;
        const v3 = wave3.geo.attributes.position.array;
        for (let i = 0; i < v3.length; i += 3) {
            v3[i + 1] = Math.sin(v3[i] * 0.007 + t * 0.3 + 3) * (8 + sf * 15);
        }
        wave3.geo.attributes.position.needsUpdate = true;
        wave3.m.position.y = -50 + sf * 30;

        // Camera
        camera.position.y = 200 - sf * 180;
        camera.position.z = 420 - sf * 160;
        camera.rotation.x = -0.45 + sf * 0.25 + mouseSmooth.y * 0.03;
        camera.rotation.y = mouseSmooth.x * 0.05 + sf * 0.1;

        // Ring 1 (always visible)
        ring1.m.rotation.x = t * 0.2 + sf * 0.4;
        ring1.m.rotation.y = t * 0.15 + mouseSmooth.x * 0.2;
        ring1.m.position.y = -20 + Math.sin(t * 0.4) * 15 + sf * 30;

        // Ring 2 (appears at 40% scroll)
        const r2p = Math.max(0, (sf - 0.4) / 0.2);
        ring2.mat.opacity = r2p * 0.08;
        ring2.m.position.set(-80 + sf * 20, 10 + Math.cos(t * 0.5) * 10, -30);
        ring2.m.rotation.set(t * 0.3, t * 0.2, sf * 0.5);

        // Dodecahedron (appears at 50% scroll)
        const dp = Math.max(0, (sf - 0.5) / 0.2);
        dMat.opacity = dp * 0.14;
        dMesh.rotation.x = t * 0.25;
        dMesh.rotation.y = t * 0.35 + sf * 0.6;
        dMesh.position.y = 20 + Math.sin(t * 0.6) * 10 + sf * 20;

        // Particles
        particles.rotation.y = t * 0.015 + sf * 0.4;
        particles.rotation.x = t * 0.008 + sf * 0.1;
        pMat.opacity = 0.4 + sf * 0.15;
        particles.position.y = sf * -30;

        renderer.render(scene, camera);
    }
    mainAnimate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ── 6. MAIN APP LOGIC ───────────────────────────────────────────────────────
function launchMainApp() {
    document.getElementById('mainApp').style.display = 'block';

    // Start Three.js main scene
    startMainScene();

    // Welcome greeting
    const name = localStorage.getItem('cl_name');
    if (name) {
        const chip = document.getElementById('userChip');
        const chipName = document.getElementById('userChipName');
        if (chip && chipName) {
            chipName.textContent = name.split(' ')[0];
            chip.style.display = 'flex';
            chip.classList.add('chip-enter');
        }
        if (!sessionStorage.getItem('cl_greeted')) {
            sessionStorage.setItem('cl_greeted', '1');
            const banner = document.getElementById('welcomeBanner');
            const bannerT = document.getElementById('welcomeText');
            const dismiss = document.getElementById('welcomeDismiss');
            if (banner && bannerT) {
                const hr = new Date().getHours();
                bannerT.textContent = `${hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}, ${name}! 🎉`;
                banner.style.display = 'flex';
                requestAnimationFrame(() => banner.classList.add('banner-visible'));
                const t = setTimeout(() => hideBanner(banner), 5000);
                dismiss.addEventListener('click', () => { clearTimeout(t); hideBanner(banner); });
            }
        }
    }
    function hideBanner(el) {
        el.classList.remove('banner-visible');
        setTimeout(() => el.style.display = 'none', 400);
    }

    // DOM refs
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
    const historyBtn = $('historyBtn');
    const historyPanel = $('historyPanel');
    const historyList = $('historyList');
    const historyClose = $('historyClose');
    const historyClear = $('historyClear');

    let isListening = false, currentLanguage = 'en-IN', fontEnlarged = false;
    const GROQ_API_KEY = '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';

    // ── History ──
    function getHistory() { try { return JSON.parse(localStorage.getItem('cl_history') || '[]'); } catch { return []; } }
    function saveToHistory(q) {
        const h = getHistory(); h.unshift({ query: q, time: new Date().toLocaleString() });
        if (h.length > 20) h.length = 20;
        localStorage.setItem('cl_history', JSON.stringify(h));
    }
    function renderHistory() {
        const h = getHistory();
        if (!h.length) { historyList.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:24px;">No history yet.</p>'; return; }
        historyList.innerHTML = h.map(item => `
            <div class="history-item" data-query="${item.query.replace(/"/g, '&quot;')}">
                <span class="history-query">${item.query}</span>
                <span class="history-time">${item.time}</span>
            </div>`).join('');
        historyList.querySelectorAll('.history-item').forEach(el => el.addEventListener('click', () => {
            queryInput.value = el.dataset.query; historyPanel.classList.remove('open'); submitBtn.click();
        }));
    }
    historyBtn.addEventListener('click', () => { renderHistory(); historyPanel.classList.toggle('open'); });
    historyClose.addEventListener('click', () => historyPanel.classList.remove('open'));
    historyClear.addEventListener('click', () => { localStorage.removeItem('cl_history'); renderHistory(); });

    // ── Speech Synthesis ──
    const synth = window.speechSynthesis;
    let currentUtterance = null, synthResumeInterval = null, availableVoices = [];
    function loadVoices() { availableVoices = synth.getVoices(); }
    loadVoices();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
    function pickVoice(lang) {
        const p = lang.split('-')[0];
        return availableVoices.find(v => v.lang === lang) || availableVoices.find(v => v.lang.startsWith(p)) || availableVoices.find(v => v.default) || null;
    }
    function speakText(text) {
        synth.cancel(); clearInterval(synthResumeInterval);
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = currentLanguage;
        currentUtterance.rate = parseFloat(speedSlider.value);
        const voice = pickVoice(currentLanguage);
        if (voice) currentUtterance.voice = voice;
        currentUtterance.onend = () => clearInterval(synthResumeInterval);
        currentUtterance.onerror = () => clearInterval(synthResumeInterval);
        synth.speak(currentUtterance);
        synthResumeInterval = setInterval(() => { if (!synth.speaking) clearInterval(synthResumeInterval); else synth.resume(); }, 5000);
    }
    $('pauseBtn').onclick = () => { synth.pause(); clearInterval(synthResumeInterval); };
    $('resumeBtn').onclick = () => { synth.resume(); synthResumeInterval = setInterval(() => { if (!synth.speaking) clearInterval(synthResumeInterval); else synth.resume(); }, 5000); };
    $('stopBtn').onclick = () => { synth.cancel(); clearInterval(synthResumeInterval); };

    // ── Speech Recognition ──
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false; recognition.interimResults = true; recognition.lang = currentLanguage;
        recognition.onstart = () => { isListening = true; micBtn.classList.add('listening'); queryBox.classList.add('listening-active'); setStatus('🔴 Listening… Speak now', 'listening-text'); queryHint.style.display = 'none'; };
        recognition.onresult = (event) => {
            let interim = '', final = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            queryInput.value = final || interim;
        };
        recognition.onerror = (event) => {
            stopListeningUI();
            const err = { 'no-speech': '🔇 No speech detected.', 'audio-capture': '🎤 No microphone.', 'not-allowed': '🚫 Mic denied.', 'network': '🌐 Network error.', 'aborted': 'Cancelled.' };
            setStatus(err[event.error] || '❌ Mic error.', 'error-text');
        };
        recognition.onend = () => { const had = queryInput.value.trim().length > 0; stopListeningUI(); if (had) setStatus('✅ Got it! Press ➜ to submit.', 'success-text'); };
    }
    function stopListeningUI() { isListening = false; micBtn.classList.remove('listening'); queryBox.classList.remove('listening-active'); }
    micBtn.addEventListener('click', () => {
        if (!recognition) return setStatus('🚫 Voice not supported.', 'error-text');
        if (isListening) { recognition.stop(); }
        else { queryInput.value = ''; recognition.lang = currentLanguage; try { recognition.start(); } catch { recognition.stop(); setTimeout(() => { recognition.lang = currentLanguage; recognition.start(); }, 200); } }
    });

    queryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitBtn.click(); } });

    // ── Fetch Steps from Groq ──
    async function fetchSteps(query) {
        const isHindi = currentLanguage === 'hi-IN';
        const systemPrompt = `You are CareLink Bharat. Return ONLY a JSON array of step strings. No markdown. 5-8 simple steps max. ${isHindi ? 'Language: Hindi' : 'Language: English'}. Example: ["Open WhatsApp.", "Tap Chat."]`;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: query }], temperature: 0.2 })
            });
            if (!response.ok) throw new Error(`API ${response.status}`);
            const data = await response.json();
            const match = data.choices[0].message.content.match(/\[.*\]/s);
            if (!match) throw new Error('No JSON');
            const steps = JSON.parse(match[0]);
            if (!Array.isArray(steps) || !steps.length) throw new Error('Empty');
            saveToHistory(query);
            renderSteps(query, steps);
        } catch (err) {
            console.error(err);
            loadingState.classList.remove('visible');
            emptyState.classList.remove('hidden');
            setStatus('❌ Request failed. Please try again.', 'error-text');
        }
    }

    function renderSteps(query, steps) {
        loadingState.classList.remove('visible');
        $('stepsTitleText').textContent = query;
        const container = $('stepsContainer');
        container.innerHTML = '';
        steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'step-card'; card.style.opacity = '0';
            card.innerHTML = `<div class="step-number">${i + 1}</div><div class="step-body"><p class="step-text">${step}</p><div class="step-actions" style="display:none;"><button class="done-btn" onclick="window._clMarkDone(${i})">Done ✓</button><button class="repeat-btn" onclick="window._clSpeakStep(${i})">🔊 Repeat</button></div></div>`;
            container.appendChild(card);
        });
        stepsSection.classList.add('visible'); progressSec.classList.add('visible'); voiceCtrl.classList.add('visible');
        window._clSteps = steps;
        anime({ targets: '.step-card', translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(150), easing: 'easeOutExpo', complete: () => activateStep(0) });
        updateProgress(0, steps.length);
    }

    function activateStep(idx) {
        document.querySelectorAll('.step-card').forEach((card, i) => {
            card.classList.toggle('active', i === idx);
            const actions = card.querySelector('.step-actions');
            if (actions) actions.style.display = i === idx ? 'flex' : 'none';
            if (i === idx) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); speakText(window._clSteps[idx]); }
        });
    }
    window._clMarkDone = function (idx) {
        const cards = document.querySelectorAll('.step-card');
        cards[idx].classList.replace('active', 'done');
        cards[idx].querySelector('.step-number').textContent = '✓';
        const next = idx + 1;
        updateProgress(next, window._clSteps.length);
        if (next < window._clSteps.length) activateStep(next);
        else { stepsSection.classList.remove('visible'); progressSec.classList.remove('visible'); voiceCtrl.classList.remove('visible'); celebration.classList.add('visible'); speakText('Congratulations! You have completed all steps.'); }
    };
    window._clSpeakStep = (idx) => speakText(window._clSteps[idx]);
    function updateProgress(done, total) { $('progressCount').textContent = `${done} of ${total} steps done`; $('progressFill').style.width = `${(done / total) * 100}%`; }
    function setStatus(text, cls) { micStatus.textContent = text; micStatus.className = 'mic-status ' + (cls || ''); }

    submitBtn.addEventListener('click', () => {
        const q = queryInput.value.trim();
        if (!q) return setStatus('Please enter a query.', 'error-text');
        setStatus('', ''); celebration.classList.remove('visible'); stepsSection.classList.remove('visible');
        progressSec.classList.remove('visible'); voiceCtrl.classList.remove('visible');
        emptyState.classList.add('hidden'); loadingState.classList.add('visible');
        synth.cancel(); clearInterval(synthResumeInterval); fetchSteps(q);
    });

    langToggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
        const isHindi = currentLanguage === 'hi-IN';
        langToggle.textContent = isHindi ? 'हि / EN' : 'EN / हि';
        if (recognition) recognition.lang = currentLanguage;
        queryInput.placeholder = isHindi ? 'कुछ भी पूछें…' : "Ask anything… e.g. 'How to send a WhatsApp photo?'";
        queryHint.innerHTML = isHindi ? '💡 कोशिश करें: <strong>"बिजली का बिल ऑनलाइन कैसे भरें?"</strong>' : '💡 Try: <strong>"How do I pay an electricity bill online?"</strong>';
        setStatus(isHindi ? '🌐 भाषा: हिन्दी' : '🌐 Language: English', 'info-text');
    });

    fontToggle.addEventListener('click', () => {
        fontEnlarged = !fontEnlarged;
        document.documentElement.style.setProperty('--font-size-base', fontEnlarged ? '22px' : '18px');
        fontToggle.textContent = fontEnlarged ? 'Aa−' : 'Aa+';
    });

    $('newQueryBtn').addEventListener('click', () => {
        celebration.classList.remove('visible'); stepsSection.classList.remove('visible');
        progressSec.classList.remove('visible'); voiceCtrl.classList.remove('visible');
        emptyState.classList.remove('hidden'); queryInput.value = ''; queryHint.style.display = '';
        setStatus('', ''); synth.cancel(); clearInterval(synthResumeInterval);
    });

    document.querySelectorAll('.example-chip').forEach(chip => chip.addEventListener('click', () => {
        queryInput.value = chip.dataset.query; submitBtn.click();
    }));
}
