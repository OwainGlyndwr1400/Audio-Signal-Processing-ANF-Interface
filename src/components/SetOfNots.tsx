import React, { useState } from 'react';
import { Card } from './Card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Layers, ArrowRight, Activity } from 'lucide-react';

export const SetOfNots: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState<string[]>(['m1']);
  
  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };
  
  // Generate synthetic data
  // Target: Complex function
  // M1: Simple approx
  // M2: Fits residual
  const data = React.useMemo(() => {
    const points = [];
    for (let x = 0; x <= 10; x += 0.1) {
      const target = Math.sin(x) + 0.5 * Math.sin(3 * x) + 0.2 * Math.random();
      const m1 = Math.sin(x); // Base model
      const r1 = target - m1; // Residual 1
      const m2 = 0.5 * Math.sin(3 * x); // Correction model
      
      points.push({
        x: x.toFixed(1),
        target,
        m1,
        r1,
        m2,
        combined: m1 + m2
      });
    }
    return points;
  }, []);

  return (
    <Card title="Recursive Architecture" subtitle="The 'Set of Nots' Optimization" className="h-full">
      <div className="flex flex-col h-full gap-6">
        
        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={() => toggleLayer('m1')}
                className={`p-3 rounded-lg border transition-all text-left group ${activeLayers.includes('m1') ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800'}`}
            >
                <div className="text-[10px] font-mono uppercase mb-1 flex items-center gap-2">
                    Pass 1 <ArrowRight size={10} className={`transition-transform ${activeLayers.includes('m1') ? 'opacity-100' : 'opacity-50'}`} />
                </div>
                <div className="text-sm font-bold group-hover:text-zinc-300 transition-colors">Macro-Structure</div>
                <div className="text-[10px] opacity-70 mt-1">M₁ captures low-freq geometry</div>
            </button>

            <button 
                onClick={() => toggleLayer('r1')}
                className={`p-3 rounded-lg border transition-all text-left group ${activeLayers.includes('r1') ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800'}`}
            >
                <div className="text-[10px] font-mono uppercase mb-1 flex items-center gap-2">
                    Residuals <Activity size={10} className={`transition-transform ${activeLayers.includes('r1') ? 'opacity-100' : 'opacity-50'}`} />
                </div>
                <div className="text-sm font-bold group-hover:text-zinc-300 transition-colors">The "Nots"</div>
                <div className="text-[10px] opacity-70 mt-1">R₁ = Target - M₁</div>
            </button>

            <button 
                onClick={() => toggleLayer('combined')}
                className={`p-3 rounded-lg border transition-all text-left group ${activeLayers.includes('combined') ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800'}`}
            >
                <div className="text-[10px] font-mono uppercase mb-1 flex items-center gap-2">
                    Synthesis <Layers size={10} className={`transition-transform ${activeLayers.includes('combined') ? 'opacity-100' : 'opacity-50'}`} />
                </div>
                <div className="text-sm font-bold group-hover:text-zinc-300 transition-colors">Convergence</div>
                <div className="text-[10px] opacity-70 mt-1">M_final = M₁ + M₂</div>
            </button>
        </div>

        {/* Visualization */}
        <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="x" hide />
                    <YAxis hide domain={[-2, 2]} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                        itemStyle={{ fontFamily: 'monospace' }}
                    />
                    
                    {/* Target Field (Ghost) */}
                    <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#333" 
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fill="url(#gradTarget)" 
                        name="Ground Truth"
                    />

                    {/* Active Layers */}
                    {activeLayers.includes('m1') && (
                        <Area 
                            type="monotone" 
                            dataKey="m1" 
                            stroke="#00F0FF" 
                            strokeWidth={2}
                            fill="none" 
                            name="Model 1 (Macro)"
                            animationDuration={500}
                        />
                    )}

                    {activeLayers.includes('r1') && (
                        <Area 
                            type="monotone" 
                            dataKey="r1" 
                            stroke="#FFAA00" 
                            strokeWidth={2}
                            fill="none" 
                            name="Residuals (Nots)"
                            animationDuration={500}
                        />
                    )}

                    {activeLayers.includes('combined') && (
                        <Area 
                            type="monotone" 
                            dataKey="combined" 
                            stroke="#00FF99" 
                            strokeWidth={2}
                            fill="none" 
                            name="Combined Prediction"
                            animationDuration={500}
                        />
                    )}

                </AreaChart>
            </ResponsiveContainer>
            
            <div className="absolute top-2 right-2 text-[10px] font-mono text-zinc-500">
                min || C(r) - Ĉ(r; Θ) ||²
            </div>
        </div>
      </div>
    </Card>
  );
};
