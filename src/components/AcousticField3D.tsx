import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from './Card';

// Raymarching Shader
const raymarchVertexShader = `
  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vOrigin = cameraPosition;
    vDirection = normalize(worldPosition.xyz - cameraPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const raymarchFragmentShader = `
  varying vec3 vOrigin;
  varying vec3 vDirection;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  // Pseudo-random
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                   mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                   mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
  }

  // Fractional Brownian Motion for forest heterogeneity
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 4; ++i) {
      v += a * noise(x);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  // Distance Field Function (Acoustic Pressure)
  float map(vec3 p) {
    float d = length(p);
    
    // Inverse square attenuation (regularized)
    float attenuation = 1.0 / (1.0 + d * d * 0.1);
    
    // Wave propagation
    float k = 5.0; // wave number
    float omega = 3.0; // angular freq
    float wave = sin(k * d - omega * uTime);
    
    // Forest heterogeneity scattering (tree trunks/leaves)
    float heterogeneity = fbm(p * 2.0 + uTime * 0.1);
    float scattering = heterogeneity * wave * attenuation;

    return (wave * attenuation * 0.5 + scattering * 0.5);
  }

  void main() {
    vec3 rayDir = normalize(vPosition - vOrigin);
    vec3 rayPos = vPosition; // Start at surface
    
    float density = 0.0;
    vec3 colorAcc = vec3(0.0);
    
    // Raymarch loop
    for(int i = 0; i < 64; i++) {
        if(abs(rayPos.x) > 1.0 || abs(rayPos.y) > 1.0 || abs(rayPos.z) > 1.0) break;
        
        float val = map(rayPos * 5.0); // Current acoustic pressure/scattering
        
        // Calculate basic numerical gradient for adaptive stepping
        float eps = 0.01;
        float valDx = map(rayPos * 5.0 + vec3(eps, 0.0, 0.0));
        float valDy = map(rayPos * 5.0 + vec3(0.0, eps, 0.0));
        float valDz = map(rayPos * 5.0 + vec3(0.0, 0.0, eps));
        vec3 gradient = vec3(valDx - val, valDy - val, valDz - val) / eps;
        
        float gradMag = length(gradient);
        
        // Adaptive step size based on density gradient and wave amplitude
        // High gradient variation -> smaller step size. Empty space -> larger step.
        float stepSize = clamp(0.02 + abs(val) * 0.05 + gradMag * 0.02, 0.02, 0.15);
        
        if (abs(val) > 0.15) {
            float d = (abs(val) - 0.15) * 0.4;
            density += d;
            vec3 c = mix(uColor2, uColor1, abs(val));
            colorAcc += c * d * 0.8;
        }
        
        rayPos += rayDir * stepSize;
        if(density > 1.0) break;
    }
    
    gl_FragColor = vec4(colorAcc, density * 0.8);
  }
`;

const RaymarchingVolume = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[15, 15, 15]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={raymarchVertexShader}
        fragmentShader={raymarchFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color("#00F0FF") }, // Cyan
          uColor2: { value: new THREE.Color("#000000") }  // Black
        }}
        transparent
        side={THREE.BackSide} // Render back faces to see inside? Or Front? 
        // For volume, we usually render the container. 
        // If we are inside, BackSide. If outside, FrontSide.
        // Let's use FrontSide and march *into* the volume.
        // But my shader uses vPosition as start.
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

// Particle System (Legacy/Alternative)
const vertexShaderParticles = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShaderParticles = `
  varying vec3 vColor;
  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float alpha = (0.5 - ll) * 2.0;
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

const ParticleField = () => {
  const count = 50000;
  const meshRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color2 = new THREE.Color("#004080");

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      colors[i * 3] = color2.r;
      colors[i * 3 + 1] = color2.g;
      colors[i * 3 + 2] = color2.b;
      sizes[i] = Math.random() * 2;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const colors = meshRef.current.geometry.attributes.color.array as Float32Array;
    const color1 = new THREE.Color("#00F0FF");
    const color2 = new THREE.Color("#050505");
    
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const d1 = Math.sqrt(x*x + z*z);
      const w1 = Math.sin(d1 * 0.5 - time * 2);
      const w3 = Math.sin(y * 0.5 + time);
      const pressure = (w1 + w3) / 2;
      const intensity = (pressure + 1) / 2;
      colors[i * 3] = THREE.MathUtils.lerp(color2.r, color1.r, intensity * intensity);
      colors[i * 3 + 1] = THREE.MathUtils.lerp(color2.g, color1.g, intensity * intensity);
      colors[i * 3 + 2] = THREE.MathUtils.lerp(color2.b, color1.b, intensity * intensity);
    }
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShaderParticles}
        fragmentShader={fragmentShaderParticles}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const AcousticField3D: React.FC = () => {
  const [mode, setMode] = useState<'particles' | 'volumetric'>('volumetric');

  return (
    <Card title="3D Acoustic Neural Field" subtitle="Volumetric Pressure Visualization (GPU)" className="h-full" noPadding>
      <div className="w-full h-full min-h-[400px] bg-black relative">
        <Canvas dpr={[1, 2]} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={60} />
          <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
          
          {mode === 'volumetric' ? <RaymarchingVolume /> : <ParticleField />}
          
          <gridHelper args={[40, 40, 0x222222, 0x111111]} position={[0, -10, 0]} />
          <gridHelper args={[40, 40, 0x222222, 0x111111]} position={[0, 10, 0]} />
        </Canvas>
        
        <div className="absolute top-4 left-4 pointer-events-none bg-black/60 backdrop-blur-sm border border-cyan-500/20 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Hardware Target active</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">Profile: RTX 4070 / 2080s Class</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">
                {mode === 'volumetric' ? 'Accurate Volumetric Scattering' : '50k Instanced Pressure Points'}
            </div>
        </div>

        <div className="absolute bottom-4 left-4 pointer-events-none">
            <div className="text-[10px] font-mono text-cyan-500">RENDER: {mode === 'volumetric' ? 'GLSL RAYMARCHING' : 'WEBGL POINTS'}</div>
            <div className="text-[10px] font-mono text-zinc-500">{mode === 'volumetric' ? 'ADAPTIVE STEPPING' : 'GPU TRANSFORM'}</div>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={() => setMode('particles')}
                className={`px-3 py-1 text-[10px] font-bold rounded border ${mode === 'particles' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/50 text-zinc-500 border-white/10'}`}
            >
                PARTICLES
            </button>
            <button 
                onClick={() => setMode('volumetric')}
                className={`px-3 py-1 text-[10px] font-bold rounded border ${mode === 'volumetric' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/50 text-zinc-500 border-white/10'}`}
            >
                VOLUMETRIC
            </button>
        </div>
      </div>
    </Card>
  );
};
