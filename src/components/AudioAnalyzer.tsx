import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Mic, Square, Activity } from 'lucide-react';

export const AudioAnalyzer: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [metrics, setMetrics] = useState({ rms: 0, peak: 0, estimatedT60: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // T60 Estimation Logic (Simplified)
  const energyHistoryRef = useRef<{t: number, e: number}[]>([]);
  const lastPeakTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsRecording(true);
      draw();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    cancelAnimationFrame(rafRef.current);
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    // Calculate RMS
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const val = (dataArrayRef.current[i] - 128) / 128;
      sum += val * val;
      if (Math.abs(val) > peak) peak = Math.abs(val);
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);

    // T60 Estimation (Very rough approximation based on decay)
    const now = performance.now();
    const energy = rms;
    
    // Keep history for decay analysis
    energyHistoryRef.current.push({ t: now, e: energy });
    if (energyHistoryRef.current.length > 100) energyHistoryRef.current.shift();

    // Detect impulse (sudden peak)
    if (energy > 0.5 && now - lastPeakTimeRef.current > 1000) {
        lastPeakTimeRef.current = now;
    }

    // If we had a peak recently, look at decay
    let estimatedT60 = metrics.estimatedT60;
    if (now - lastPeakTimeRef.current < 2000 && now - lastPeakTimeRef.current > 100) {
        // Simple linear regression on log energy could go here
        // For visual demo, we'll just map current decay rate
        estimatedT60 = Math.max(0.1, Math.min(2.0, 1.0 / (1 - energy))); // Dummy mapping
    }

    setMetrics({ rms, peak, estimatedT60 });

    // Visualization
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00F0FF';
    ctx.beginPath();

    const sliceWidth = width / dataArrayRef.current.length;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <Card title="Acoustic Input Analysis" subtitle="Real-time Signal Processing" className="h-full">
      <div className="flex flex-col h-full gap-4">
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden border border-white/10 min-h-[150px]">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={200} 
            className="w-full h-full object-cover"
          />
          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <button 
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full transition-all"
              >
                <Mic size={20} />
                <span>Initialize Sensor</span>
              </button>
            </div>
          )}
          {isRecording && (
            <button 
                onClick={stopRecording}
                className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-full transition-all"
            >
                <Square size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 p-3 rounded border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase">RMS Level</div>
                <div className="text-xl font-mono text-white">{(metrics.rms * 100).toFixed(1)}<span className="text-xs text-zinc-600">%</span></div>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase">Peak Amplitude</div>
                <div className="text-xl font-mono text-cyan-400">{metrics.peak.toFixed(2)}</div>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase">Est. T60</div>
                <div className="text-xl font-mono text-amber-500">{metrics.estimatedT60.toFixed(2)}<span className="text-xs text-zinc-600">s</span></div>
            </div>
        </div>
      </div>
    </Card>
  );
};
