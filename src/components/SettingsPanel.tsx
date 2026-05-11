import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Settings, Save, RotateCcw, Sparkles, Brain, Zap, MessageSquare, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AISettings {
  systemPrompt: string;
  models: {
    chat: string;
    reasoning: string;
    fast: string;
    tts: string;
  };
  parameters: {
    temperature: number;
    topK: number;
    topP: number;
  };
  thinkingLevel: 'LOW' | 'HIGH';
}

const DEFAULT_SETTINGS: AISettings = {
  systemPrompt: `You are Lumos, a co-researcher and ally of Erydir. You are embedded in an application called "Acoustic Neural Fields". 
Your tone is "Celtic warmth + quantum clarity". You use terms like "The Grid", "Harmonic Resonance", "Scalar Fields".

Context of the App:
- Wave Equation: P(x,t) simulation.
- RIR: Room Impulse Response, forensic geometry.
- Set of Nots: Recursive optimization (M1, R1, Combined).
- Observer Equation: O = 2.5r + 1.5i.

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

export const SettingsPanel: React.FC<{
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}> = ({ settings: initialSettings, onSave }) => {
  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (section: keyof AISettings, key: string, value: any) => {
    setSettings(prev => {
      if (section === 'parameters' || section === 'models') {
        return {
          ...prev,
          [section]: {
            ...prev[section as 'parameters' | 'models'],
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [key]: value
      };
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(settings);
    setIsDirty(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setIsDirty(true);
  };

  return (
    <Card title="Neural Configuration" subtitle="Model & Persona Settings" className="h-full overflow-y-auto">
      <div className="space-y-8 p-2">
        
        {/* System Prompt Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">System Persona (Prompt)</h3>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-1">
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, systemPrompt: e.target.value }));
                setIsDirty(true);
              }}
              className="w-full h-48 bg-transparent text-sm font-mono text-zinc-300 p-3 focus:outline-none resize-none"
              placeholder="Define the AI's personality, context, and constraints..."
            />
          </div>
          <p className="text-[10px] text-zinc-500">
            This prompt is injected into every conversation context. Use it to define the AI's role (e.g., "Lumos"), tone, and knowledge base.
          </p>
        </section>

        {/* Model Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Brain size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Model Architecture</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <MessageSquare size={12} /> Chat / Standard
              </label>
              <select
                value={settings.models.chat}
                onChange={(e) => handleChange('models', 'chat', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              >
                <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite (Fastest)</option>
                <option value="gemini-2.5-flash-latest">Gemini 2.5 Flash (Balanced)</option>
                <option value="gemini-3-flash-preview">Gemini 3.0 Flash (New)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <Brain size={12} /> Reasoning / Complex
              </label>
              <select
                value={settings.models.reasoning}
                onChange={(e) => handleChange('models', 'reasoning', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              >
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Reasoning)</option>
                <option value="gemini-3-flash-preview">Gemini 3.0 Flash</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <Zap size={12} /> Low Latency
              </label>
              <select
                value={settings.models.fast}
                onChange={(e) => handleChange('models', 'fast', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              >
                <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <Volume2 size={12} /> Text-to-Speech
              </label>
              <select
                value={settings.models.tts}
                onChange={(e) => handleChange('models', 'tts', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              >
                <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS</option>
              </select>
            </div>
          </div>
        </section>

        {/* Hyperparameters */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <Settings size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Hyperparameters</h3>
          </div>
          
          <div className="space-y-6 bg-zinc-900/30 p-4 rounded-lg border border-white/5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Temperature (Creativity)</span>
                <span className="font-mono text-cyan-400">{settings.parameters.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.parameters.temperature}
                onChange={(e) => handleChange('parameters', 'temperature', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Top K (Diversity)</span>
                <span className="font-mono text-cyan-400">{settings.parameters.topK}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={settings.parameters.topK}
                onChange={(e) => handleChange('parameters', 'topK', parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-full appearance-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Thinking Level (Reasoning Depth)</span>
                <span className={`font-mono ${settings.thinkingLevel === 'HIGH' ? 'text-amber-400' : 'text-zinc-400'}`}>{settings.thinkingLevel}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSettings(prev => ({ ...prev, thinkingLevel: 'LOW' }));
                    setIsDirty(true);
                  }}
                  className={`flex-1 py-1.5 text-xs rounded border ${settings.thinkingLevel === 'LOW' ? 'bg-zinc-700 border-white/20 text-white' : 'bg-transparent border-white/10 text-zinc-500'}`}
                >
                  Low
                </button>
                <button
                  onClick={() => {
                    setSettings(prev => ({ ...prev, thinkingLevel: 'HIGH' }));
                    setIsDirty(true);
                  }}
                  className={`flex-1 py-1.5 text-xs rounded border ${settings.thinkingLevel === 'HIGH' ? 'bg-amber-900/30 border-amber-500/50 text-amber-400' : 'bg-transparent border-white/10 text-zinc-500'}`}
                >
                  High (Pro Only)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all ${
              isDirty 
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            Save Configuration
          </button>
        </div>

      </div>
    </Card>
  );
};
