import React from 'react';
import { Card } from './Card';
import { motion } from 'framer-motion';

export const ObserverEquation: React.FC = () => {
  return (
    <Card title="The Observer Equation" subtitle="Epistemological Inversion" className="h-full flex flex-col justify-center">
      <div className="flex flex-col items-center justify-center h-full py-8 space-y-8">
        
        <div className="relative">
            <motion.div 
                className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-500 tracking-tighter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                O = 2.5r + 1.5i
            </motion.div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl -z-10 rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="text-2xl font-mono text-cyan-400">2.5r</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Real Observation</div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                    Coordinate system & sampling density. The physical constraints of the PAM network.
                </p>
            </motion.div>

            <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
            >
                <div className="text-2xl font-mono text-amber-500">1.5i</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Universal Potential</div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                    The 3D volume to be rendered. The imaginary component awaiting collapse into geometry.
                </p>
            </motion.div>
        </div>

        <div className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-lg mt-4">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-zinc-500">STABILITY LOOP</span>
                <span className="text-green-500">1 = 1</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
            </div>
        </div>

      </div>
    </Card>
  );
};
