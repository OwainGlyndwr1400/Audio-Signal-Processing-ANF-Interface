import React, { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { Play, Pause } from 'lucide-react';

export const WaveField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [frequency, setFrequency] = useState(5);
  const [waveSpeed, setWaveSpeed] = useState(2);
  
  // Simulation state
  const timeRef = useRef(0);
  const animationRef = useRef<number>(0);
  const pulsesRef = useRef<{startTime: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      if (!ctx || !canvas) return;
      
      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;

      // Draw scalar wave field
      // P(x,t) visualization
      
      ctx.lineWidth = 2;
      
      // Multiple wave fronts
      for (let r = 0; r < maxRadius; r += 20) {
        const phase = (r / 20) - (timeRef.current * waveSpeed);
        const amplitude = Math.sin(phase * (frequency * 0.1));
        
        // Opacity based on amplitude and distance decay (1/r)
        const distanceDecay = Math.max(0, 1 - r / maxRadius);
        const alpha = Math.max(0, (amplitude + 1) / 2) * distanceDecay;

        if (alpha > 0.01) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            // Color shift based on phase (compression vs rarefaction)
            const hue = amplitude > 0 ? 180 : 200; // Cyan to Blue
            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.stroke();
        }
      }

      // Draw source
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      
      // Draw manual pulses
      for (let i = pulsesRef.current.length - 1; i >= 0; i--) {
        const pulse = pulsesRef.current[i];
        const age = timeRef.current - pulse.startTime;
        if (age > 0) {
            const r = age * waveSpeed * 10; // Speed multiplier
            const alpha = Math.max(0, 1 - r / maxRadius);
            
            if (alpha > 0.01) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                pulsesRef.current.splice(i, 1);
            }
        }
      }

      if (isRunning) {
        timeRef.current += 0.05;
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, frequency, waveSpeed]);

  const triggerPulse = () => {
    pulsesRef.current.push({ startTime: timeRef.current });
  };

  return (
    <Card title="Scalar Wave Equation" subtitle="P(x,t) Propagation Model" className="h-full" noPadding>
      <div className="relative w-full h-64 md:h-96 bg-black overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-cyan-400"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={triggerPulse}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-mono uppercase tracking-wider text-white border border-white/10 transition-colors"
          >
            Pulse (δ)
          </button>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500">Frequency (Hz)</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={frequency} 
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500">Celerity (c)</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={waveSpeed} 
                onChange={(e) => setWaveSpeed(Number(e.target.value))}
                className="accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
              />
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 text-right pointer-events-none">
            <div className="text-xs font-mono text-cyan-500/80">∇²p = (1/c²)∂²p/∂t²</div>
            <div className="text-[10px] text-zinc-600 mt-1">G(x, x₀, t)</div>
        </div>
      </div>
    </Card>
  );
};
