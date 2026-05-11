import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const RIRVisualizer: React.FC = () => {
  const [reflectionOrder, setReflectionOrder] = useState(2);
  const [roomSize, setRoomSize] = useState(10); // meters
  
  // Generate synthetic RIR data based on Image Source Method (simplified 1D)
  const rirData = useMemo(() => {
    const c = 343; // Speed of sound m/s
    const data = [];
    const maxTime = 0.1; // seconds
    
    // Direct path
    const directDist = 2; // Arbitrary distance
    const directTime = directDist / c;
    
    // Add direct sound
    data.push({ time: directTime * 1000, amplitude: 1.0, type: 'Direct' });

    // Add reflections
    for (let i = 1; i <= reflectionOrder * 5; i++) {
        // Simulate reflections arriving later with lower amplitude
        // In a real ISM, this would be calculated from 3D coordinates
        const dist = directDist + (i * roomSize * 0.5); 
        const time = dist / c;
        const decay = Math.pow(0.7, i); // Reflection coefficient
        const spread = 1 / (dist * dist); // 1/r^2 spreading loss (approx)
        
        if (time < maxTime) {
            data.push({ 
                time: time * 1000, 
                amplitude: decay * spread * 5, // Scaling for visibility
                type: 'Reflection' 
            });
        }
    }
    
    // Sort by time
    return data.sort((a, b) => a.time - b.time).map((d, i) => ({...d, id: i}));
  }, [reflectionOrder, roomSize]);

  // Generate continuous plot data
  const plotData = useMemo(() => {
    const points = [];
    const maxTime = 100; // ms
    for (let t = 0; t <= maxTime; t += 0.5) {
        let amp = 0;
        // Check if any impulse is near this time
        const impulse = rirData.find(d => Math.abs(d.time - t) < 0.5);
        if (impulse) {
            amp = impulse.amplitude;
        } else {
            // Add some noise floor
            amp = (Math.random() - 0.5) * 0.02;
        }
        points.push({ time: t, amplitude: amp });
    }
    return points;
  }, [rirData]);

  return (
    <Card title="Room Impulse Response (RIR)" subtitle="Forensic Geometry Encoder" className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Controls & Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Image Source Method</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Reflections of order <span className="font-mono text-white">n</span> are treated as virtual sources. 
                        The RIR <span className="font-mono text-white">h(x_s, x_r, t)</span> encodes the room's geometry.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase text-zinc-500 font-semibold">Reflection Order (n)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="0" 
                            max="5" 
                            step="1"
                            value={reflectionOrder} 
                            onChange={(e) => setReflectionOrder(Number(e.target.value))}
                            className="flex-1 accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                        <span className="font-mono text-sm w-8 text-right">{reflectionOrder}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase text-zinc-500 font-semibold">Room Scale (m)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="2" 
                            max="20" 
                            value={roomSize} 
                            onChange={(e) => setRoomSize(Number(e.target.value))}
                            className="flex-1 accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
                        />
                        <span className="font-mono text-sm w-8 text-right">{roomSize}m</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-600">
                    d_n = c · t_n = |x_r - x_s⁽ⁿ⁾|
                </div>
            </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 flex flex-col h-64 lg:h-auto min-h-[300px]">
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={plotData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            stroke="#666" 
                            fontSize={10} 
                            tickLine={false}
                            label={{ value: 'Time (ms)', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 10 }}
                        />
                        <YAxis hide domain={[-1.2, 1.2]} />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    
                                    // Generate narrative text based on type/time
                                    let narrative = "";
                                    if (data.type === 'Direct') {
                                        narrative = "Direct path from source to receiver. Represents the shortest distance, containing no geometric boundary data.";
                                    } else if (data.type === 'Reflection') {
                                        if (data.time < 15) {
                                            narrative = "First-order reflection. Likely off the closest parallel boundary (e.g., floor or front wall).";
                                        } else if (data.time < 30) {
                                            narrative = "Second-order reflection. Complex path bouncing between multiple surfaces (e.g., wall to ceiling to receiver).";
                                        } else {
                                            narrative = "Higher-order reflection. Dense scattering typical of multi-boundary traversal, embedding detailed spatial modes.";
                                        }
                                    } else {
                                        narrative = "Stochastic reverberation tail. High reflection density parameterized via Sabine properties.";
                                    }

                                    return (
                                        <div className="bg-black/90 border border-zinc-800 p-3 rounded shadow-xl backdrop-blur-sm">
                                            <div className="text-xs font-mono text-zinc-400 mb-1">{label} ms</div>
                                            <div className="text-sm font-bold text-cyan-400 mb-2">{data.type}</div>
                                            
                                            <div className="text-[10px] text-zinc-300 max-w-[200px] leading-relaxed">
                                                {narrative}
                                            </div>
                                            
                                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono">
                                                <span>Amp: {data.amplitude.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="amplitude" 
                            stroke="#00F0FF" 
                            strokeWidth={1.5} 
                            dot={false} 
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between px-4 text-[10px] text-zinc-500 font-mono uppercase mt-2">
                <span>Direct Wave</span>
                <span>Early Reflections</span>
                <span>Late Reverberation</span>
            </div>
        </div>
      </div>
    </Card>
  );
};
