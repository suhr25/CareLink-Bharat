import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 2500, mouse }) {
    const mesh = useRef();
    const light = useRef();

    const [positions, sizes, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        const c1 = new THREE.Color('#56C8D8');
        const c2 = new THREE.Color('#7B68EE');
        const c3 = new THREE.Color('#F0A050');
        const c4 = new THREE.Color('#34D399');

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2 + Math.random() * 6;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            sizes[i] = Math.random() * 3 + 0.5;
            const color = [c1, c2, c3, c4][Math.floor(Math.random() * 4)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return [positions, sizes, colors];
    }, [count]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (mesh.current) {
            mesh.current.rotation.y = t * 0.02;
            mesh.current.rotation.x = Math.sin(t * 0.1) * 0.1;
            // Mouse-reactive rotation
            mesh.current.rotation.z = (mouse.current.x || 0) * 0.05;
        }
        if (light.current) {
            light.current.position.x = Math.sin(t * 0.3) * 3;
            light.current.position.y = Math.cos(t * 0.2) * 2;
        }
    });

    return (
        <>
            <pointLight ref={light} color="#56C8D8" intensity={0.3} distance={15} />
            <points ref={mesh}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
                    <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    sizeAttenuation
                    transparent
                    opacity={0.7}
                    vertexColors
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </>
    );
}

function NebulaOrbs({ mouse }) {
    const groupRef = useRef();
    const orbData = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 4 - 2
            ],
            color: ['#56C8D8', '#7B68EE', '#F0A050', '#34D399', '#E879F9', '#60A5FA'][i],
            scale: 0.3 + Math.random() * 0.6,
            speed: 0.1 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
        }));
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                const d = orbData[i];
                child.position.y = d.position[1] + Math.sin(t * d.speed + d.phase) * 0.5;
                child.position.x = d.position[0] + Math.cos(t * d.speed * 0.7 + d.phase) * 0.3;
                child.rotation.x += 0.002;
                child.rotation.y += 0.003;
                const s = d.scale * (1 + Math.sin(t * 0.4 + d.phase) * 0.15);
                child.scale.setScalar(s);
                child.material.opacity = 0.04 + Math.sin(t * 0.5 + d.phase) * 0.02;
            });
            // Mouse parallax
            groupRef.current.rotation.y = (mouse.current.x || 0) * 0.08;
            groupRef.current.rotation.x = (mouse.current.y || 0) * -0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {orbData.map((orb, i) => (
                <mesh key={i} position={orb.position}>
                    <icosahedronGeometry args={[1, 3]} />
                    <meshBasicMaterial
                        color={orb.color}
                        transparent
                        opacity={0.05}
                        wireframe={i % 2 === 0}
                    />
                </mesh>
            ))}
        </group>
    );
}

function AuroraPlane() {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.x = -0.3 + Math.sin(t * 0.15) * 0.05;
            meshRef.current.position.y = -2 + Math.sin(t * 0.2) * 0.3;
            meshRef.current.material.opacity = 0.015 + Math.sin(t * 0.3) * 0.008;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, -2, -3]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[20, 8, 32, 32]} />
            <meshBasicMaterial
                color="#56C8D8"
                transparent
                opacity={0.02}
                side={THREE.DoubleSide}
                wireframe
            />
        </mesh>
    );
}

export default function CosmicBackground() {
    const mouse = useRef({ x: 0, y: 0 });

    const handlePointerMove = (e) => {
        mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'auto',
            }}
            onPointerMove={handlePointerMove}
        >
            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.1} />
                <Particles mouse={mouse} />
                <NebulaOrbs mouse={mouse} />
                <AuroraPlane />
            </Canvas>
        </div>
    );
}
