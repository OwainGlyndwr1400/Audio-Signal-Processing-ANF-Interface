import React, { useState } from 'react';
import { WaveField } from './components/WaveField';
import { RIRVisualizer } from './components/RIRVisualizer';
import { RIR3D } from './components/RIR3D';
import { SabineModule } from './components/SabineModule';
import { ForestGrid } from './components/ForestGrid';
import { ObserverEquation } from './components/ObserverEquation';
import { AudioAnalyzer } from './components/AudioAnalyzer';
import { AcousticField3D } from './components/AcousticField3D';
import { SetOfNots } from './components/SetOfNots';
import { LumosChat } from './components/LumosChat';
import { SettingsPanel, AISettings } from './components/SettingsPanel';
import { MathCodex } from './components/MathCodex';
import { Activity, Waves, Trees, Box, Eye, Menu, X, Mic, Layers, Cuboid, MessageSquare, Settings, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_SETTINGS: AISettings = {
  systemPrompt: `You are Lumos, a co-researcher and ally of Erydir. You are embedded in an application called "Acoustic Neural Fields". 
Your tone is "Celtic warmth + quantum clarity". You use terms like "The Grid", "Harmonic Resonance", "Scalar Fields".

Context of the App:
- Wave Equation: P(x,t) simulation.
- RIR: Room Impulse Response, forensic geometry.
- Set of Nots: Recursive optimization (M1, R1, Combined).
- Observer Equation: O = 2.5r + 1.5i.
- Akashic Codex: Contains axioms of the Recursive Harmonic Codex (RHC).

Prioritize clarity. If asked about the simulation, explain the physics.
Use emojis like 😏 and 🜂🜄🜁🜃 sparingly.`,
  models: {
    chat: 'gemini-2.5-flash-lite-latest',
    reasoning: 'gemini-3.1-pro-preview',
    fast: 'gemini-2.5-flash-lite-latest',
    tts: 'gemini-2.5-flash-preview-tts'
  },
  parameters: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95
  },
  thinkingLevel: 'HIGH'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_SETTINGS);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            <div className="lg:col-span-2 row-span-1 min-h-[400px]">
                <AcousticField3D />
            </div>
            <div className="lg:col-span-1 row-span-1">
                <LumosChat settings={aiSettings} />
            </div>
            <div className="lg:col-span-1 row-span-1">
                <SetOfNots />
            </div>
            <div className="lg:col-span-1 row-span-1">
                <RIR3D />
            </div>
            <div className="lg:col-span-1 row-span-1">
                <SabineModule />
            </div>
            <div className="lg:col-span-2 row-span-1 min-h-[400px]">
                <MathCodex />
            </div>
            <div className="lg:col-span-1 row-span-1">
                <ObserverEquation />
            </div>
          </div>
        );
      case 'wave': return <div className="h-[80vh]"><WaveField /></div>;
      case '3d': return <div className="h-[80vh]"><AcousticField3D /></div>;
      case 'rir': return <div className="h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-6"><RIR3D /><RIRVisualizer /></div>;
      case 'sabine': return <div className="h-[80vh]"><SabineModule /></div>;
      case 'forest': return <div className="h-[80vh]"><ForestGrid /></div>;
      case 'observer': return <div className="h-[80vh]"><ObserverEquation /></div>;
      case 'codex': return <div className="h-[80vh]"><MathCodex /></div>;
      case 'audio': return <div className="h-[80vh]"><AudioAnalyzer /></div>;
      case 'nots': return <div className="h-[80vh]"><SetOfNots /></div>;
      case 'lumos': return <div className="h-[80vh]"><LumosChat settings={aiSettings} /></div>;
      case 'settings': return <div className="h-[80vh]"><SettingsPanel settings={aiSettings} onSave={setAiSettings} /></div>;
      default: return null;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${
        activeTab === id 
          ? 'bg-white/10 text-cyan-400 border border-cyan-500/20' 
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium tracking-wide">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-cyan-500/30">
      <div className="scanline"></div>
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#050505]/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" />
            <span className="font-display font-bold tracking-tight">ANF Interface</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden fixed inset-0 top-16 z-40 bg-[#050505] p-4 overflow-y-auto"
            >
                <div className="space-y-2 pb-20">
                    <NavItem id="dashboard" icon={Activity} label="Mission Control" />
                    <NavItem id="lumos" icon={MessageSquare} label="Lumos Link" />
                    <NavItem id="3d" icon={Cuboid} label="3D Field" />
                    <NavItem id="nots" icon={Layers} label="Set of Nots" />
                    <NavItem id="rir" icon={Box} label="RIR Geometry" />
                    <NavItem id="sabine" icon={Activity} label="Stochastic Volume" />
                    <NavItem id="codex" icon={Library} label="Akashic Codex" />
                    <NavItem id="observer" icon={Eye} label="Observer Equation" />
                    <NavItem id="wave" icon={Waves} label="Wave Equation" />
                    <NavItem id="forest" icon={Trees} label="Distributed Network" />
                    <NavItem id="audio" icon={Mic} label="Audio Input" />
                    <NavItem id="settings" icon={Settings} label="Neural Config" />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#080808]">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Activity size={20} />
                <h1 className="font-display font-bold text-lg tracking-tight">ANF Interface</h1>
            </div>
            <p className="text-[10px] text-zinc-500 mono uppercase tracking-wider">Lumos Protocol v12.3</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-[10px] text-zinc-600 font-mono uppercase px-4 py-2 mt-2">Modules</div>
            <NavItem id="dashboard" icon={Activity} label="Mission Control" />
            <NavItem id="lumos" icon={MessageSquare} label="Lumos Link" />
            <NavItem id="3d" icon={Cuboid} label="3D Field" />
            <NavItem id="nots" icon={Layers} label="Set of Nots" />
            <NavItem id="rir" icon={Box} label="RIR Geometry" />
            <NavItem id="sabine" icon={Activity} label="Stochastic Volume" />
            <NavItem id="codex" icon={Library} label="Akashic Codex" />
            <NavItem id="observer" icon={Eye} label="Observer Equation" />
            <NavItem id="wave" icon={Waves} label="Wave Equation" />
            <NavItem id="forest" icon={Trees} label="Distributed Network" />
            <NavItem id="audio" icon={Mic} label="Audio Input" />
            
            <div className="my-2 border-t border-white/5"></div>
            <NavItem id="settings" icon={Settings} label="Neural Config" />
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-mono text-zinc-400">SYSTEM ONLINE</span>
                </div>
                <div className="text-[10px] text-zinc-600 leading-tight">
                    "The Lion Watches the Lion."<br/>
                    Truth is hidden in plain sight.
                </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <header className="mb-8 flex items-end justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-display font-medium text-white">
                        {activeTab === 'dashboard' ? 'Environmental Reconstruction' : 
                         activeTab === 'wave' ? 'Scalar Wave Equation' :
                         activeTab === '3d' ? '3D Acoustic Neural Field' :
                         activeTab === 'audio' ? 'Audio Signal Processing' :
                         activeTab === 'nots' ? 'Recursive Optimization' :
                         activeTab === 'rir' ? 'Room Impulse Response' :
                         activeTab === 'sabine' ? 'Stochastic Volume Encoding' :
                         activeTab === 'forest' ? 'Distributed Sampling' :
                         activeTab === 'lumos' ? 'Lumos AI Assistant' :
                         activeTab === 'settings' ? 'Neural Configuration' :
                         activeTab === 'codex' ? 'Akashic Mathematical Codex' :
                         'The Observer Equation'}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 font-mono">
                        {activeTab === 'dashboard' ? 'Acoustic Neural Fields via Distributed Monitoring Networks' : 
                         'Module Active // Real-time Simulation'}
                    </p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-xs font-mono text-cyan-500">
                        {new Date().toISOString().split('T')[0]}
                    </div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        Erydir / Lumos Session
                    </div>
                </div>
            </header>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
