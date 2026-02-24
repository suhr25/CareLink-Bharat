(function () {
    'use strict';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.prepend(renderer.domElement);

    
    const mouse = { x: 0, y: 0 };
    const ms = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const gridGeo = new THREE.PlaneGeometry(1400, 900, 60, 40);
    gridGeo.rotateX(-Math.PI * 0.3);
    const gridMat = new THREE.MeshBasicMaterial({
        color: 0x56C8D8,
        wireframe: true,
        transparent: true,
        opacity: 0.04,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.position.y = -150;
    grid.position.z = -100;
    scene.add(grid);

    const gridGeo2 = new THREE.PlaneGeometry(1400, 900, 30, 20);
    gridGeo2.rotateX(-Math.PI * 0.3);
    const gridMat2 = new THREE.MeshBasicMaterial({
        color: 0x7B68EE,
        wireframe: true,
        transparent: true,
        opacity: 0.025,
    });
    const grid2 = new THREE.Mesh(gridGeo2, gridMat2);
    grid2.position.y = -100;
    grid2.position.z = -150;
    scene.add(grid2);

    function makeRing(radius, tube, color, ox, oy, oz) {
        const geo = new THREE.TorusGeometry(radius, tube, 16, 120);
        const mat = new THREE.MeshBasicMaterial({
            color,
            wireframe: false,
            transparent: true,
            opacity: 0.0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(ox, oy, oz);
        scene.add(mesh);
        return { mesh, mat };
    }

    const ring1 = makeRing(90, 0.9, 0x56C8D8, 0, 0, -80);
    const ring2 = makeRing(130, 0.6, 0x7B68EE, 0, 0, -120);
    const ring3 = makeRing(60, 0.7, 0xF0A050, -60, 30, -60);
    const ring4 = makeRing(45, 0.5, 0x56C8D8, 80, -40, -40);

    function fadeIn(matRef, target, duration) {
        const start = performance.now();
        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            matRef.opacity = p * target;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    setTimeout(() => fadeIn(ring1.mat, 0.12, 1200), 300);
    setTimeout(() => fadeIn(ring2.mat, 0.07, 1200), 500);
    setTimeout(() => fadeIn(ring3.mat, 0.10, 1200), 700);
    setTimeout(() => fadeIn(ring4.mat, 0.08, 1200), 900);

    
    const icoGeo = new THREE.IcosahedronGeometry(28, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0x56C8D8,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(0, 0, 0);
    scene.add(ico);
    setTimeout(() => fadeIn(icoMat, 0.14, 1400), 200);

    function makeOcta(size, color, x, y, z) {
        const geo = new THREE.OctahedronGeometry(size, 0);
        const mat = new THREE.MeshBasicMaterial({
            color, wireframe: true, transparent: true, opacity: 0.0
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return { mesh, mat };
    }

    const octa1 = makeOcta(12, 0xF0A050, -110, 50, -20);
    const octa2 = makeOcta(9, 0x7B68EE, 130, -60, -30);
    const octa3 = makeOcta(7, 0x56C8D8, 60, 80, -10);

    setTimeout(() => fadeIn(octa1.mat, 0.18, 1200), 600);
    setTimeout(() => fadeIn(octa2.mat, 0.15, 1200), 800);
    setTimeout(() => fadeIn(octa3.mat, 0.12, 1000), 500);

    const STAR_COUNT = 120;
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starColor = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        starPos[i3] = (Math.random() - 0.5) * 800;
        starPos[i3 + 1] = (Math.random() - 0.5) * 500;
        starPos[i3 + 2] = (Math.random() - 0.5) * 300;

        const r = Math.random();
        if (r > 0.6) { starColor[i3] = 0.34; starColor[i3 + 1] = 0.78; starColor[i3 + 2] = 0.85; }
        else if (r > 0.3) { starColor[i3] = 0.48; starColor[i3 + 1] = 0.41; starColor[i3 + 2] = 0.93; }
        else { starColor[i3] = 0.94; starColor[i3 + 1] = 0.63; starColor[i3 + 2] = 0.31; }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColor, 3));

    const starMat = new THREE.PointsMaterial({
        size: 1.6, vertexColors: true,
        transparent: true, opacity: 0.3,
        depthWrite: false, blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    function makeLine(fromPos, toPos, color) {
        const pts = [new THREE.Vector3(...fromPos), new THREE.Vector3(...toPos)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.07 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        return { line, mat };
    }

    const lines = [
        makeLine([0, 0, 0], [-110, 50, -20], 0x56C8D8),
        makeLine([0, 0, 0], [130, -60, -30], 0x7B68EE),
        makeLine([0, 0, 0], [60, 80, -10], 0x56C8D8),
        makeLine([-110, 50, -20], [60, 80, -10], 0xF0A050),
        makeLine([130, -60, -30], [60, 80, -10], 0x7B68EE),
    ];

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        ms.x += (mouse.x - ms.x) * 0.05;
        ms.y += (mouse.y - ms.y) * 0.05;

        camera.position.x = ms.x * 18;
        camera.position.y = ms.y * -12 + Math.sin(t * 0.3) * 4;
        camera.lookAt(0, 0, 0);

        const gridVerts = gridGeo.attributes.position.array;
        for (let i = 0; i <= 60; i++) {
            for (let j = 0; j <= 40; j++) {
                const idx = (i * 41 + j) * 3;
                const x = gridVerts[idx];
                const z = gridVerts[idx + 2];
                gridVerts[idx + 1] =
                    Math.sin(x * 0.009 + t * 0.4) * 12 +
                    Math.cos(z * 0.008 + t * 0.3) * 8;
            }
        }
        gridGeo.attributes.position.needsUpdate = true;

        ring1.mesh.rotation.x = t * 0.22 + ms.y * 0.3;
        ring1.mesh.rotation.y = t * 0.17 + ms.x * 0.3;

        ring2.mesh.rotation.x = -t * 0.15;
        ring2.mesh.rotation.z = t * 0.12 + ms.x * 0.2;

        ring3.mesh.rotation.y = t * 0.3;
        ring3.mesh.rotation.x = -t * 0.2;
        ring3.mesh.position.y = 30 + Math.sin(t * 0.7) * 8;

        ring4.mesh.rotation.z = t * 0.4;
        ring4.mesh.rotation.x = t * 0.25;
        ring4.mesh.position.y = -40 + Math.cos(t * 0.8) * 6;

        ico.rotation.x = t * 0.18;
        ico.rotation.y = t * 0.26 + ms.x * 0.15;
        const icoScale = 1 + Math.sin(t * 0.5) * 0.06;
        ico.scale.setScalar(icoScale);

        octa1.mesh.rotation.x = t * 0.35 + ms.y * 0.2;
        octa1.mesh.rotation.y = t * 0.5;
        octa1.mesh.position.x = -110 + Math.sin(t * 0.4) * 12;
        octa1.mesh.position.y = 50 + Math.cos(t * 0.6) * 8;

        octa2.mesh.rotation.y = -t * 0.45;
        octa2.mesh.rotation.z = t * 0.3;
        octa2.mesh.position.x = 130 + Math.sin(t * 0.5 + 1) * 10;
        octa2.mesh.position.y = -60 + Math.cos(t * 0.4 + 2) * 7;

        octa3.mesh.rotation.x = t * 0.6;
        octa3.mesh.rotation.z = -t * 0.4;
        octa3.mesh.position.y = 80 + Math.sin(t * 0.8) * 5;

        lines.forEach(({ mat }, i) => {
            mat.opacity = 0.04 + Math.sin(t * 0.5 + i) * 0.04;
        });

        stars.rotation.y = t * 0.008;
        stars.rotation.x = t * 0.004;
        starMat.opacity = 0.28 + Math.sin(t * 0.4) * 0.06;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();

