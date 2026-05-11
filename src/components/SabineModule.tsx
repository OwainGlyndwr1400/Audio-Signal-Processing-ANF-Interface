import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Wireframe } from '@react-three/drei';
import * as THREE from 'three';

const T60DecaySphere = ({ t60, mode }: { t60: number, mode: 'forward' | 'inverse' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Wrap time based on T60 to simulate repeated decays
    const cycleTime = time % (t60 * 2 + 1); // 1 sec padding
    
    // Calculate exponential decay scale
    let scale = 1.0;
    if (cycleTime < t60) {
      // e^(-kt) decay mapping
      scale = Math.exp((-13.8 * cycleTime) / t60);
    } else {
      scale = 0; // Wait
    }
    
    // Minimum scale so it doesn't disappear completely
    const renderScale = Math.max(scale * 1.5, 0.01); 
    meshRef.current.scale.set(renderScale, renderScale, renderScale);
    
    // Rotate slowly
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.rotation.x = time * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 3]} />
      <meshBasicMaterial 
        color={mode === 'forward' ? "#FFAB00" : "#00F0FF"} 
        wireframe 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
};

export const SabineModule: React.FC = () => {
  const [mode, setMode] = useState<'forward' | 'inverse'>('forward');
  
  // Forward Mode State
  const [volume, setVolume] = useState(500); // m^3
  const [absorption, setAbsorption] = useState(0.15); // Coefficient

  // Inverse Mode State
  const [measuredT60, setMeasuredT60] = useState(1.5); // seconds
  const [firstReflectionTime, setFirstReflectionTime] = useState(20); // ms

  // Calculations
  // Forward
  const side = Math.pow(volume, 1/3);
  const surfaceArea = 6 * Math.pow(side, 2);
  const totalAbsorption = surfaceArea * absorption;
  const t60 = (0.161 * volume) / totalAbsorption;

  // Inverse (Extrapolating V and A from T60 and first reflection)
  const c = 343; // m/s
  // Iterative heuristic estimation
  // If first reflection arrives at t_first, path length = c * t_first.
  // We deduce characteristic dimension. For a cubic room, direct+bounce path roughly implies L ~= c * t_first / 1000.
  const estimatedDimension = (c * (firstReflectionTime / 1000));
  const estimatedVolume = Math.pow(estimatedDimension, 3);
  // From Volume and measured T60, we extract Total Absorption
  const estimatedTotalAbsorption = (0.161 * estimatedVolume) / measuredT60;

  // Graph Data
  const activeT60 = mode === 'forward' ? t60 : measuredT60;
  const decayData = [];
  
  for (let t = 0; t <= 2.5; t += 0.05) {
    const energy = Math.exp((-13.8 * t) / activeT60);
    // Convert energy to dB (assuming Reference = 1.0)
    // -60 dB definition for T60
    const db = 10 * Math.log10(energy + 1e-12); // clamp to avoid -Infinity
    decayData.push({ 
      time: t.toFixed(2), 
      energy: energy, 
      db: Math.max(-60, db) // Cap visually at -60dB
    });
  }

  return (
    <Card title="Stochastic Volume Encoding" subtitle="Sabine’s Formula & T₆₀" className="h-full">
      <div className="flex flex-col h-full gap-6">
        
        {/* Mode Switch */}
        <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
            <button 
                onClick={() => setMode('forward')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${mode === 'forward' ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Forward (Predict T₆₀)
            </button>
            <button 
                onClick={() => setMode('inverse')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${mode === 'inverse' ? 'bg-cyan-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Inverse (Extract V, A)
            </button>
        </div>

        {/* Metrics Display */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg text-center">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    {mode === 'forward' ? 'Volume (V)' : 'Est. Volume (V)'}
                </div>
                <div className={`text-xl font-mono ${mode === 'forward' ? 'text-white' : 'text-cyan-400'}`}>
                    {mode === 'forward' ? volume : estimatedVolume.toFixed(0)}
                    <span className="text-xs text-zinc-600">m³</span>
                </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-3 rounded-lg text-center">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    {mode === 'forward' ? 'Absorption (A)' : 'Est. Abs (A)'}
                </div>
                <div className={`text-xl font-mono ${mode === 'forward' ? 'text-white' : 'text-cyan-400'}`}>
                    {mode === 'forward' ? totalAbsorption.toFixed(1) : estimatedTotalAbsorption.toFixed(1)}
                    <span className="text-xs text-zinc-600">sabins</span>
                </div>
            </div>
            <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg text-center">
                <div className="text-[10px] text-amber-500/80 uppercase tracking-wider mb-1">
                    {mode === 'forward' ? 'Reverb Time (T₆₀)' : 'Input T₆₀'}
                </div>
                <div className="text-xl font-mono text-amber-500">
                    {activeT60.toFixed(2)}
                    <span className="text-xs text-amber-500/60">s</span>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
            {mode === 'forward' ? (
                <>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs uppercase text-zinc-500 font-semibold">Habitat Volume</label>
                            <span className="text-xs font-mono text-zinc-400">{volume} m³</span>
                        </div>
                        <input 
                            type="range" 
                            min="50" 
                            max="2000" 
                            step="10"
                            value={volume} 
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs uppercase text-zinc-500 font-semibold">Absorption Coeff (α)</label>
                            <span className="text-xs font-mono text-zinc-400">{absorption.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.01" 
                            max="0.99" 
                            step="0.01"
                            value={absorption} 
                            onChange={(e) => setAbsorption(Number(e.target.value))}
                            className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs uppercase text-zinc-500 font-semibold">Measured T₆₀ (Tail)</label>
                            <span className="text-xs font-mono text-cyan-400">{measuredT60.toFixed(2)} s</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="5.0" 
                            step="0.1"
                            value={measuredT60} 
                            onChange={(e) => setMeasuredT60(Number(e.target.value))}
                            className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs uppercase text-zinc-500 font-semibold">First Reflection Time</label>
                            <span className="text-xs font-mono text-cyan-400">{firstReflectionTime} ms</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max="100" 
                            step="1"
                            value={firstReflectionTime} 
                            onChange={(e) => setFirstReflectionTime(Number(e.target.value))}
                            className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                        <div className="text-[10px] text-zinc-600">
                            Estimates dimension L ≈ c · t / 1.4
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Decay Graph & 3D Visualization */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[200px]">
          {/* 3D T60 Pulsing Sphere */}
          <div className="w-full md:w-1/3 bg-black/50 border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 left-2 text-[10px] font-mono text-zinc-500 z-10 w-full text-center md:text-left">
              Decay Envelope (3D)
            </div>
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
              <T60DecaySphere t60={activeT60} mode={mode} />
            </Canvas>
          </div>

          <div className="flex-1 relative border border-white/5 bg-black/30 rounded-lg p-2">
              <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-600 z-10">Energy Decay Curve (dB)</div>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={decayData}>
                      <defs>
                          <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={mode === 'forward' ? "#FFAB00" : "#00F0FF"} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={mode === 'forward' ? "#FFAB00" : "#00F0FF"} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[-60, 0]} hide />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                          itemStyle={{ color: mode === 'forward' ? '#FFAB00' : '#00F0FF', fontFamily: 'monospace' }}
                          labelStyle={{ display: 'none' }}
                          formatter={(value: number) => [value.toFixed(1) + ' dB', 'Energy']}
                      />
                      <Area 
                          type="monotone" 
                          dataKey="db" 
                          stroke={mode === 'forward' ? "#FFAB00" : "#00F0FF"} 
                          fillOpacity={1} 
                          fill="url(#colorDb)" 
                      />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};
