import React, { useEffect, useRef } from 'react';
import { Card } from './Card';

export const ForestGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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

    let frame = 0;
    const sensors = Array.from({ length: 8 }).map(() => ({
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.8 + 0.1,
        phase: Math.random() * Math.PI * 2
    }));

    const render = () => {
        if (!ctx || !canvas) return;
        
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        // Draw Grid
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        const gridSize = 40;
        
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw "Forest" Impedance Map (Simulated as organic shapes)
        ctx.fillStyle = '#111';
        for (let i = 0; i < 5; i++) {
            const x = (Math.sin(i * 123 + frame * 0.001) * 0.3 + 0.5) * w;
            const y = (Math.cos(i * 321 + frame * 0.001) * 0.3 + 0.5) * h;
            const r = 50 + Math.sin(frame * 0.01 + i) * 20;
            
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Sensors (PAMs) and their "Meticulous Fish" scan lines
        sensors.forEach((s, i) => {
            const sx = s.x * w;
            const sy = s.y * h;

            // Sensor Node
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00F0FF';
            ctx.fill();
            
            // Pulse
            const pulseR = (Math.sin(frame * 0.05 + s.phase) + 1) * 10;
            ctx.beginPath();
            ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 - pulseR/40})`;
            ctx.stroke();

            // Connectivity / Triangulation lines
            sensors.forEach((s2, j) => {
                if (i < j) {
                    const sx2 = s2.x * w;
                    const sy2 = s2.y * h;
                    const dist = Math.hypot(sx - sx2, sy - sy2);
                    
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(sx2, sy2);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist/150)})`;
                        ctx.stroke();
                    }
                }
            });
        });

        // Draw "Meticulous Fish" scanning rays (Forward, Backward, Middle-Out)
        const scanYFwd = (frame % h);
        const scanYBwd = h - (frame % h);
        const midOut = h / 2 + Math.sin(frame * 0.05) * (h / 2);
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.fillRect(0, scanYFwd, w, 2); // Forward
        
        ctx.fillStyle = 'rgba(255, 170, 0, 0.05)';
        ctx.fillRect(0, scanYBwd, w, 2); // Backward

        ctx.fillStyle = 'rgba(255, 0, 255, 0.08)';
        ctx.fillRect(0, midOut, w, 2); // Middle-Out
        ctx.fillRect(0, h - midOut, w, 2); // Middle-Out mirror

        frame++;
        requestAnimationFrame(render);
    };

    render();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <Card title="Distributed Sampling Network" subtitle="Passive Acoustic Monitors (PAMs)" className="h-full" noPadding>
        <div className="relative w-full h-full min-h-[300px]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/10 p-3 rounded text-[10px] font-mono">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold">PROTOCOL ACTIVE: METICULOUS FISH</span>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-zinc-400 hidden sm:flex">
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-cyan-400" /> Forward Pass</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-amber-500" /> Backward Pass</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-fuchsia-500" /> Middle-Out Extraction</div>
                </div>
            </div>
        </div>
    </Card>
  );
};
