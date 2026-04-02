import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Flowing Mesh Gradient Ribbons ── */
function FlowingRibbons() {
    const groupRef = useRef();

    const ribbonData = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => {
            const curve = new THREE.CatmullRomCurve3(
                Array.from({ length: 8 }, (_, j) => new THREE.Vector3(
                    (j - 3.5) * 2.5 + (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 3 + i * 0.8 - 2,
                    (Math.random() - 0.5) * 2 - 3
                )),
                false,
                'catmullrom',
                0.5
            );
            return {
                curve,
                color: ['#56C8D8', '#7B68EE', '#F0A050', '#34D399', '#E879F9'][i],
                speed: 0.08 + Math.random() * 0.06,
                phase: Math.random() * Math.PI * 2,
                width: 0.015 + Math.random() * 0.01,
            };
        });
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                const d = ribbonData[i];
                child.rotation.z = Math.sin(t * d.speed + d.phase) * 0.15;
                child.rotation.x = Math.cos(t * d.speed * 0.7 + d.phase) * 0.1;
                child.position.y = Math.sin(t * d.speed * 0.5 + d.phase) * 0.3;
                child.material.opacity = 0.12 + Math.sin(t * 0.4 + d.phase) * 0.06;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {ribbonData.map((d, i) => {
                const points = d.curve.getPoints(80);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                return (
                    <line key={i} geometry={geometry}>
                        <lineBasicMaterial
                            color={d.color}
                            transparent
                            opacity={0.15}
                            linewidth={1}
                        />
                    </line>
                );
            })}
        </group>
    );
}

/* ── Floating Glass Orbs ── */
function FloatingOrbs() {
    const groupRef = useRef();

    const orbData = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6 - 3
            ],
            color: ['#56C8D8', '#7B68EE', '#F0A050', '#34D399', '#E879F9', '#60A5FA', '#FBBF24', '#A78BFA'][i],
            scale: 0.08 + Math.random() * 0.2,
            speed: 0.05 + Math.random() * 0.1,
            phase: Math.random() * Math.PI * 2,
        }))
    , []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                const d = orbData[i];
                child.position.y = d.position[1] + Math.sin(t * d.speed + d.phase) * 0.8;
                child.position.x = d.position[0] + Math.cos(t * d.speed * 0.6 + d.phase) * 0.4;
                const s = d.scale * (1 + Math.sin(t * 0.3 + d.phase) * 0.2);
                child.scale.setScalar(s);
                child.material.opacity = 0.04 + Math.sin(t * 0.5 + d.phase) * 0.025;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {orbData.map((orb, i) => (
                <mesh key={i} position={orb.position}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color={orb.color}
                        transparent
                        opacity={0.05}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ── Subtle Particle Field ── */
function ParticleField({ count = 1500 }) {
    const mesh = useRef();

    const [positions, colors, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sz = new Float32Array(count);
        const palette = [
            new THREE.Color('#56C8D8'),
            new THREE.Color('#7B68EE'),
            new THREE.Color('#F0A050'),
            new THREE.Color('#34D399'),
        ];

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 25;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
            sz[i] = Math.random() * 2 + 0.5;
            const c = palette[Math.floor(Math.random() * palette.length)];
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }
        return [pos, col, sz];
    }, [count]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (mesh.current) {
            mesh.current.rotation.y = t * 0.005;
            mesh.current.rotation.x = Math.sin(t * 0.05) * 0.02;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
                <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                sizeAttenuation
                transparent
                opacity={0.4}
                vertexColors
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/* ── Animated Grid Floor ── */
function AnimatedGrid() {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.position.y = -4 + Math.sin(t * 0.15) * 0.2;
            meshRef.current.material.opacity = 0.03 + Math.sin(t * 0.2) * 0.01;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, -4, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
            <planeGeometry args={[40, 40, 40, 40]} />
            <meshBasicMaterial
                color="#56C8D8"
                transparent
                opacity={0.03}
                wireframe
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/* ── Scroll-reactive Camera ── */
function ScrollCamera() {
    useFrame((state) => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const scrollFactor = window.scrollY / maxScroll;
        state.camera.position.y = 0.5 - scrollFactor * 1.5;
        state.camera.position.z = 8 - scrollFactor * 1.5;
        state.camera.lookAt(0, -1, 0);
    });
    return null;
}

export default function GalaxyBackground() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        >
            <Canvas
                camera={{ position: [0, 0.5, 8], fov: 60 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.03} />
                <FlowingRibbons />
                <FloatingOrbs />
                <ParticleField />
                <AnimatedGrid />
                <ScrollCamera />
            </Canvas>
        </div>
    );
}
