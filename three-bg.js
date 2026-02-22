(function () {
    'use strict';

    // ── CONFIG ──────────────────────────────────────────
    const COLS = 50;
    const ROWS = 50;
    const SEG_SIZE = 22;
    const WAVE_SPEED = 0.6;
    const WAVE_HEIGHT = 18;

    // ── SCROLL STATE ────────────────────────────────────
    let scrollY = 0;
    let scrollTarget = 0;
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    window.addEventListener('scroll', () => {
        scrollTarget = window.scrollY;
    }, { passive: true });

    // ── MOUSE ───────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ── THREE.JS SETUP ──────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        55, window.innerWidth / window.innerHeight, 1, 2000
    );
    camera.position.set(0, 200, 420);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'threeBg';
    document.body.prepend(renderer.domElement);

    // ── WAVE MESH 1 (main ocean floor) ──────────────────
    const planeGeo = new THREE.PlaneGeometry(
        COLS * SEG_SIZE, ROWS * SEG_SIZE, COLS, ROWS
    );
    planeGeo.rotateX(-Math.PI * 0.5);

    const planeMat = new THREE.MeshBasicMaterial({
        color: 0x56C8D8,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
    });

    const waveMesh = new THREE.Mesh(planeGeo, planeMat);
    waveMesh.position.y = -80;
    scene.add(waveMesh);

    // ── WAVE MESH 2 (upper layer) ───────────────────────
    const planeGeo2 = new THREE.PlaneGeometry(
        COLS * SEG_SIZE * 0.8, ROWS * SEG_SIZE * 0.8, COLS, ROWS
    );
    planeGeo2.rotateX(-Math.PI * 0.5);

    const planeMat2 = new THREE.MeshBasicMaterial({
        color: 0x7B68EE,
        wireframe: true,
        transparent: true,
        opacity: 0.04,
    });

    const waveMesh2 = new THREE.Mesh(planeGeo2, planeMat2);
    waveMesh2.position.y = -40;
    scene.add(waveMesh2);

    // ── WAVE MESH 3 (top layer — appears on scroll) ─────
    const planeGeo3 = new THREE.PlaneGeometry(
        COLS * SEG_SIZE * 1.2, ROWS * SEG_SIZE * 1.2, Math.floor(COLS * 0.7), Math.floor(ROWS * 0.7)
    );
    planeGeo3.rotateX(-Math.PI * 0.5);

    const planeMat3 = new THREE.MeshBasicMaterial({
        color: 0xF0A050,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
    });

    const waveMesh3 = new THREE.Mesh(planeGeo3, planeMat3);
    waveMesh3.position.y = -120;
    scene.add(waveMesh3);

    // ── FLOATING RING 1 ─────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(50, 1.2, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x56C8D8,
        wireframe: false,
        transparent: true,
        opacity: 0.08,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 60, -60);
    scene.add(ring);

    // ── FLOATING RING 2 (second ring, appears on scroll) ──
    const ringGeo2 = new THREE.TorusGeometry(30, 0.8, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x7B68EE,
        wireframe: false,
        transparent: true,
        opacity: 0.0,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.set(-120, 30, -40);
    scene.add(ring2);

    // ── FLOATING DODECAHEDRON (scroll-reveal shape) ─────
    const dodecGeo = new THREE.DodecahedronGeometry(20, 0);
    const dodecMat = new THREE.MeshBasicMaterial({
        color: 0xF0A050,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
    });
    const dodecahedron = new THREE.Mesh(dodecGeo, dodecMat);
    dodecahedron.position.set(180, -20, -80);
    scene.add(dodecahedron);

    // ── SUBTLE PARTICLES ────────────────────────────────
    const PARTICLE_COUNT = 70;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pPositions[i3] = (Math.random() - 0.5) * 900;
        pPositions[i3 + 1] = (Math.random() - 0.5) * 500;
        pPositions[i3 + 2] = (Math.random() - 0.5) * 400;

        const r = Math.random();
        if (r > 0.6) {
            // cyan
            pColors[i3] = 0.34; pColors[i3 + 1] = 0.78; pColors[i3 + 2] = 0.85;
        } else if (r > 0.3) {
            // lilac
            pColors[i3] = 0.48; pColors[i3 + 1] = 0.41; pColors[i3 + 2] = 0.93;
        } else {
            // warm amber
            pColors[i3] = 0.94; pColors[i3 + 1] = 0.63; pColors[i3 + 2] = 0.31;
        }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── ANIMATION LOOP ──────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // smooth scroll & mouse
        scrollY += (scrollTarget - scrollY) * 0.06;
        const sf = scrollY / maxScroll(); // 0 at top, 1 at bottom
        mouseSmooth.x += (mouse.x - mouseSmooth.x) * 0.04;
        mouseSmooth.y += (mouse.y - mouseSmooth.y) * 0.04;

        // ── Animate Wave 1 ──────────────────────────────
        const verts = planeGeo.attributes.position.array;
        const waveIntensity = 1 + sf * 0.6; // waves get taller on scroll
        for (let i = 0; i <= COLS; i++) {
            for (let j = 0; j <= ROWS; j++) {
                const idx = (i * (ROWS + 1) + j) * 3;
                const x = verts[idx];
                const z = verts[idx + 2];
                verts[idx + 1] =
                    Math.sin(x * 0.008 + t * WAVE_SPEED) * WAVE_HEIGHT * 0.6 * waveIntensity +
                    Math.sin(z * 0.006 + t * WAVE_SPEED * 0.8) * WAVE_HEIGHT * 0.4 * waveIntensity +
                    Math.cos((x + z) * 0.005 + t * 0.3) * WAVE_HEIGHT * 0.3;
            }
        }
        planeGeo.attributes.position.needsUpdate = true;

        // ── Animate Wave 2 ──────────────────────────────
        const verts2 = planeGeo2.attributes.position.array;
        for (let i = 0; i <= COLS; i++) {
            for (let j = 0; j <= ROWS; j++) {
                const idx = (i * (ROWS + 1) + j) * 3;
                const x = verts2[idx];
                const z = verts2[idx + 2];
                verts2[idx + 1] =
                    Math.sin(x * 0.01 + t * WAVE_SPEED * 0.7 + 2) * WAVE_HEIGHT * 0.5 +
                    Math.cos(z * 0.008 + t * WAVE_SPEED * 0.5 + 1) * WAVE_HEIGHT * 0.35;
            }
        }
        planeGeo2.attributes.position.needsUpdate = true;

        // ── Animate Wave 3 (scroll-reveal amber layer) ──
        const colsW3 = Math.floor(COLS * 0.7);
        const rowsW3 = Math.floor(ROWS * 0.7);
        const verts3 = planeGeo3.attributes.position.array;
        for (let i = 0; i <= colsW3; i++) {
            for (let j = 0; j <= rowsW3; j++) {
                const idx = (i * (rowsW3 + 1) + j) * 3;
                const x = verts3[idx];
                const z = verts3[idx + 2];
                verts3[idx + 1] =
                    Math.sin(x * 0.006 + t * 0.4 + 3) * WAVE_HEIGHT * 0.7 +
                    Math.cos(z * 0.007 + t * 0.35) * WAVE_HEIGHT * 0.4;
            }
        }
        planeGeo3.attributes.position.needsUpdate = true;

        // ── Scroll-reactive camera ──────────────────────
        camera.position.y = 200 - sf * 180;
        camera.position.z = 420 - sf * 160;
        camera.rotation.x = -0.45 + sf * 0.25 + mouseSmooth.y * 0.03;
        camera.rotation.y = mouseSmooth.x * 0.05 + sf * 0.1;

        // ── Scroll-reactive waves ───────────────────────
        waveMesh.position.y = -80 + sf * 40;
        planeMat.opacity = 0.07 + sf * 0.05;

        waveMesh2.position.y = -40 - sf * 30;
        waveMesh2.rotation.y = sf * 0.3;
        planeMat2.opacity = 0.04 + sf * 0.03;

        // Wave 3 fades in after 30% scroll
        const sf3 = Math.max(0, (sf - 0.3) / 0.7);
        waveMesh3.position.y = -120 + sf3 * 80;
        waveMesh3.rotation.y = -sf * 0.2;
        planeMat3.opacity = sf3 * 0.05;

        // ── Animate ring 1 ──────────────────────────────
        ring.rotation.x = t * 0.2 + sf * 1.5;
        ring.rotation.y = t * 0.15;
        ring.position.y = 60 + Math.sin(t * 0.5) * 10 - sf * 50;
        ringMat.opacity = 0.08 + sf * 0.06;
        ring.scale.setScalar(1 + Math.sin(t * 0.3) * 0.05 + sf * 0.4);

        // ── Animate ring 2 (scroll-reveal) ──────────────
        const sf2 = Math.max(0, (sf - 0.2) / 0.8);
        ring2.rotation.x = -t * 0.3 + sf * 2;
        ring2.rotation.z = t * 0.12;
        ring2.position.y = 30 + Math.sin(t * 0.7 + 1) * 8 - sf2 * 40;
        ring2.position.x = -120 + sf2 * 60;
        ringMat2.opacity = sf2 * 0.08;
        ring2.scale.setScalar(0.5 + sf2 * 0.8);

        // ── Animate dodecahedron (scroll-reveal) ────────
        const sfD = Math.max(0, (sf - 0.4) / 0.6);
        dodecahedron.rotation.x = t * 0.4;
        dodecahedron.rotation.y = -t * 0.25 + sf * 1.5;
        dodecahedron.position.y = -20 + Math.sin(t * 0.6 + 2) * 12 + sfD * 30;
        dodecahedron.position.x = 180 - sfD * 50;
        dodecMat.opacity = sfD * 0.10;
        dodecahedron.scale.setScalar(0.3 + sfD * 1.0);

        // ── Animate particles ───────────────────────────
        particles.rotation.y = t * 0.015 + sf * 0.4;
        particles.rotation.x = t * 0.008 + sf * 0.1;
        pMat.opacity = 0.4 + sf * 0.15;
        particles.position.y = sf * -30;

        renderer.render(scene, camera);
    }

    animate();

    // ── RESIZE ──────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── SCROLL-REVEAL (IntersectionObserver) ────────────
    const revealTargets = document.querySelectorAll(
        '.hero, .query-section, .steps-section, .empty-state, .celebration, .footer'
    );
    revealTargets.forEach(el => el.classList.add('scroll-reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => observer.observe(el));

})();
