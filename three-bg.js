(function () {
    'use strict';

    // ── CONFIG ──────────────────────────────────────────
    const PARTICLE_COUNT = 160;
    const LINE_MAX_DIST = 120;
    const PARTICLE_SIZE = 2.4;
    const DRIFT_SPEED = 0.0003;
    const MOUSE_INFLUENCE = 0.00015;
    const SPREAD = 500;

    // ── SETUP ───────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 1, 2000
    );
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'threeBg';
    document.body.prepend(renderer.domElement);

    // ── PARTICLES ───────────────────────────────────────
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = [];
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // palette: greens + teals matching CareLink theme
    const palette = [
        [0.18, 0.80, 0.44],   // primary green
        [0.16, 0.62, 0.43],   // primary-light
        [0.20, 0.78, 0.52],   // primary-glow
        [0.10, 0.55, 0.40],   // deep teal
        [0.30, 0.85, 0.55],   // bright mint
        [1.00, 0.55, 0.26],   // accent orange (sparse)
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * SPREAD * 2;
        positions[i3 + 1] = (Math.random() - 0.5) * SPREAD * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * SPREAD;

        velocities.push({
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3,
            z: (Math.random() - 0.5) * 0.15
        });

        // pick color — 85% green family, 15% accent orange
        const c = palette[i < PARTICLE_COUNT * 0.85
            ? Math.floor(Math.random() * 5)
            : 5];
        colors[i3] = c[0];
        colors[i3 + 1] = c[1];
        colors[i3 + 2] = c[2];
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
        size: PARTICLE_SIZE,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── CONNECTING LINES ────────────────────────────────
    const lineGeo = new THREE.BufferGeometry();
    const maxLines = PARTICLE_COUNT * 6;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // ── MOUSE TRACKING ──────────────────────────────────
    const mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ── ANIMATION LOOP ──────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();
        const posArr = particleGeo.attributes.position.array;

        // drift particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            posArr[i3] += velocities[i].x;
            posArr[i3 + 1] += velocities[i].y;
            posArr[i3 + 2] += velocities[i].z;

            // wrap around bounds
            if (posArr[i3] > SPREAD) posArr[i3] = -SPREAD;
            if (posArr[i3] < -SPREAD) posArr[i3] = SPREAD;
            if (posArr[i3 + 1] > SPREAD) posArr[i3 + 1] = -SPREAD;
            if (posArr[i3 + 1] < -SPREAD) posArr[i3 + 1] = SPREAD;
            if (posArr[i3 + 2] > SPREAD * 0.5) posArr[i3 + 2] = -SPREAD * 0.5;
            if (posArr[i3 + 2] < -SPREAD * 0.5) posArr[i3 + 2] = SPREAD * 0.5;
        }

        particleGeo.attributes.position.needsUpdate = true;

        // slow global rotation + mouse parallax
        particleSystem.rotation.y = elapsed * DRIFT_SPEED + mouse.x * MOUSE_INFLUENCE * 100;
        particleSystem.rotation.x = elapsed * DRIFT_SPEED * 0.5 + mouse.y * MOUSE_INFLUENCE * 60;
        linesMesh.rotation.copy(particleSystem.rotation);

        // update connecting lines
        let lineIdx = 0;
        const lp = lineGeo.attributes.position.array;
        const lc = lineGeo.attributes.color.array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = posArr[i * 3], iy = posArr[i * 3 + 1], iz = posArr[i * 3 + 2];
            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const dx = ix - posArr[j * 3];
                const dy = iy - posArr[j * 3 + 1];
                const dz = iz - posArr[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < LINE_MAX_DIST && lineIdx < maxLines) {
                    const alpha = 1 - dist / LINE_MAX_DIST;
                    const idx6 = lineIdx * 6;

                    lp[idx6] = ix;
                    lp[idx6 + 1] = iy;
                    lp[idx6 + 2] = iz;
                    lp[idx6 + 3] = posArr[j * 3];
                    lp[idx6 + 4] = posArr[j * 3 + 1];
                    lp[idx6 + 5] = posArr[j * 3 + 2];

                    // green-ish line color with distance-based fade
                    lc[idx6] = 0.18 * alpha; lc[idx6 + 1] = 0.80 * alpha; lc[idx6 + 2] = 0.44 * alpha;
                    lc[idx6 + 3] = 0.18 * alpha; lc[idx6 + 4] = 0.80 * alpha; lc[idx6 + 5] = 0.44 * alpha;

                    lineIdx++;
                }
            }
        }

        // zero-out unused line slots
        for (let i = lineIdx * 6; i < lp.length; i++) {
            lp[i] = 0;
            lc[i] = 0;
        }

        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;
        lineGeo.setDrawRange(0, lineIdx * 2);

        renderer.render(scene, camera);
    }

    animate();

    // ── RESIZE ──────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();
