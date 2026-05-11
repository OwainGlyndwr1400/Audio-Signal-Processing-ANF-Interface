import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from './Card';

interface ReflectionPoint {
  id: number;
  position: [number, number, number];
  order: number;
  distance: number;
  wall: string;
  time: number;
  azimuth: string;
  elevation: string;
}

const Room = () => {
  return (
    <group>
      {/* Room Wireframe 10x10x10 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 10, 10]} />
        <meshBasicMaterial color="#333" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Floor */}
      <gridHelper args={[10, 10, 0x444444, 0x222222]} position={[0, -5, 0]} />
    </group>
  );
};

const Rays = ({ source, receiver, reflections, activeReflection, setActiveReflection }: { 
  source: [number, number, number], 
  receiver: [number, number, number],
  reflections: ReflectionPoint[],
  activeReflection: number | null,
  setActiveReflection: (id: number | null) => void
}) => {
  return (
    <group>
      {/* Source */}
      <mesh position={source}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <Html position={source} distanceFactor={10}>
        <div className="text-[10px] font-mono text-white bg-black/50 px-1 rounded">Source</div>
      </Html>

      {/* Receiver */}
      <mesh position={receiver}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="#00F0FF" />
      </mesh>
      <Html position={receiver} distanceFactor={10}>
        <div className="text-[10px] font-mono text-cyan-400 bg-black/50 px-1 rounded">Receiver</div>
      </Html>

      {/* Direct Path */}
      <Line points={[source, receiver]} color="#00F0FF" opacity={0.5} transparent lineWidth={1} />

      {/* Reflections */}
      {reflections.map((r) => (
        <group key={r.id}>
          {/* Reflection Point on Wall */}
          <mesh 
            position={r.position} 
            onPointerOver={() => setActiveReflection(r.id)}
            onPointerOut={() => setActiveReflection(null)}
          >
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color={activeReflection === r.id ? "#FFAA00" : "#666"} />
          </mesh>

          {/* Ray Path: Source -> Wall -> Receiver */}
          <Line 
            points={[source, r.position, receiver]} 
            color={activeReflection === r.id ? "#FFAA00" : "#444"} 
            opacity={activeReflection === r.id ? 1 : 0.2} 
            transparent 
            lineWidth={activeReflection === r.id ? 2 : 1} 
          />

          {/* Tooltip */}
          {activeReflection === r.id && (
            <Html position={r.position} distanceFactor={8} style={{ pointerEvents: 'none' }}>
              <div className="bg-black/90 border border-amber-500/50 p-2 rounded w-48 backdrop-blur-md">
                <div className="text-xs font-bold text-amber-500 mb-1">Reflection #{r.id}</div>
                <div className="text-[10px] text-zinc-300 font-mono space-y-1">
                  <div>Order: {r.order}</div>
                  <div>Wall: {r.wall}</div>
                  <div>Dist: {r.distance.toFixed(2)}m</div>
                  <div>Time: {r.time.toFixed(2)}ms</div>
                  <div className="text-cyan-400 mt-1 pt-1 border-t border-white/10">
                    Az: {r.azimuth}° | El: {r.elevation}°
                  </div>
                </div>

                {/* Micro Waveform (Sparkline) */}
                <div className="mt-2 h-8 w-full border-t border-white/10 pt-1 relative">
                  <div className="text-[8px] text-zinc-600 absolute -top-1 right-0">Amplitude</div>
                  <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path
                      d={`M 0,10 
                          Q 20,10 40,10 
                          T 45,${10 - 8 / r.order} 
                          T 50,${10 + 6 / r.order} 
                          T 55,${10 - 4 / r.order} 
                          T 60,10
                          L 100,10`}
                      fill="none"
                      stroke="#FFAA00"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
};

// Hilbert Curve Generator (Order 2, 3, etc.)
// For simplicity, hardcode a small level-3 path for visual representation
const HILBERT_PATH = "M 10 10 L 10 30 L 30 30 L 30 10 L 50 10 L 50 30 L 70 30 L 70 10 L 90 10 L 90 30 L 90 50 L 70 50 L 70 70 L 90 70 L 90 90 L 70 90 L 70 110 L 90 110 L 90 130 L 70 130 L 50 130 L 50 110 L 50 90 L 30 90 L 30 110 L 30 130 L 10 130 L 10 110 L 10 90 L 10 70 L 30 70 L 30 50 L 10 50 Z";

export const RIR3D: React.FC = () => {
  const [activeReflection, setActiveReflection] = useState<number | null>(null);

  const source: [number, number, number] = [-2, 0, -2];
  const receiver: [number, number, number] = [2, 0, 2];

  // Synthetic reflections
  const reflections: ReflectionPoint[] = useMemo(() => {
    const rx = receiver[0];
    const ry = receiver[1];
    const rz = receiver[2];

    const rawReflections = [
      { id: 1, position: [5, 0, 0] as [number, number, number], order: 1, distance: 12.5, wall: 'Right Wall (+X)', time: 36.4, hilbertPoint: [10, 10] },
      { id: 2, position: [-5, 0, 0] as [number, number, number], order: 1, distance: 8.2, wall: 'Left Wall (-X)', time: 23.9, hilbertPoint: [30, 30] },
      { id: 3, position: [0, 5, 0] as [number, number, number], order: 1, distance: 14.1, wall: 'Ceiling (+Y)', time: 41.1, hilbertPoint: [50, 10] },
      { id: 4, position: [0, -5, 0] as [number, number, number], order: 1, distance: 14.1, wall: 'Floor (-Y)', time: 41.1, hilbertPoint: [70, 30] },
      { id: 5, position: [0, 0, 5] as [number, number, number], order: 1, distance: 10.5, wall: 'Front Wall (+Z)', time: 30.6, hilbertPoint: [90, 10] },
      { id: 6, position: [0, 0, -5] as [number, number, number], order: 1, distance: 10.5, wall: 'Back Wall (-Z)', time: 30.6, hilbertPoint: [90, 50] },
      // 2nd Order
      { id: 7, position: [5, 5, 0] as [number, number, number], order: 2, distance: 18.2, wall: 'Right-Ceiling Corner', time: 53.0, hilbertPoint: [50, 90] },
    ];

    return rawReflections.map(r => {
      const dx = r.position[0] - rx;
      const dy = r.position[1] - ry;
      const dz = r.position[2] - rz;
      
      const azimuth = Math.atan2(dx, dz) * (180 / Math.PI);
      const dist = Math.sqrt(dx*dx + dz*dz);
      const elevation = Math.atan2(dy, dist) * (180 / Math.PI);

      return {
        ...r,
        azimuth: azimuth.toFixed(1),
        elevation: elevation.toFixed(1)
      } as ReflectionPoint;
    });
  }, []);

  return (
    <Card title="3D Room Geometry" subtitle="Spatial Reflection Analysis" className="h-full" noPadding>
      <div className="w-full h-full min-h-[400px] bg-black relative flex">
        <div className="flex-1 relative">
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={50} />
            <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
            
            <Room />
            <Rays 
              source={source} 
              receiver={receiver} 
              reflections={reflections} 
              activeReflection={activeReflection}
              setActiveReflection={setActiveReflection}
            />
          </Canvas>
          
          <div className="absolute bottom-4 left-4 pointer-events-none">
              <div className="text-[10px] font-mono text-cyan-500">INTERACTIVE: HOVER POINTS</div>
              <div className="text-[10px] font-mono text-zinc-500">ISM FORWARD MODEL</div>
          </div>
        </div>

        {/* 2D Hilbert Space Mapping */}
        <div className="w-[150px] border-l border-white/10 bg-zinc-950 flex flex-col p-4 relative overflow-hidden">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Hilbert Mapping</div>
          
          <svg viewBox="0 0 100 140" className="w-full h-auto opacity-80">
             <path d={HILBERT_PATH} fill="none" stroke="#222" strokeWidth="2" strokeLinecap="square" />
             
             {reflections.map(r => {
                // @ts-ignore
                const [hx, hy] = r.hilbertPoint || [0, 0];
                const isActive = activeReflection === r.id;
                return (
                  <g key={r.id} className="transition-all duration-300">
                    <circle 
                      cx={hx} 
                      cy={hy} 
                      r={isActive ? 6 : 3} 
                      fill={isActive ? "#00F0FF" : (r.order === 1 ? "#FFAA00" : "#666")}
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveReflection(r.id)}
                      onMouseLeave={() => setActiveReflection(null)}
                    />
                    {isActive && (
                      <circle cx={hx} cy={hy} r={10} fill="none" stroke="#00F0FF" className="animate-ping opacity-50" />
                    )}
                  </g>
                );
             })}
          </svg>

          <div className="mt-4 text-[8px] text-zinc-600 font-mono leading-tight">
            2D projection preserving spatial locality of higher-order bounces.
          </div>
        </div>
      </div>
    </Card>
  );
};
