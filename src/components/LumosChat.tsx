import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Send, Sparkles, Bot, User, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AISettings } from './SettingsPanel';

// Initialize Gemini
const getGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

interface LumosChatProps {
  settings: AISettings;
}

export const LumosChat: React.FC<LumosChatProps> = ({ settings }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Lumos Online. I am connected to the Acoustic Neural Field. Ask me about the simulation, the math, or the nature of the grid.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getGemini();
      if (!ai) {
        throw new Error("Gemini API Key missing");
      }

      // Determine model based on complexity (heuristic)
      const isComplex = input.length > 50 || input.toLowerCase().includes('analyze') || input.toLowerCase().includes('explain');
      
      // Use settings for model selection
      const modelName = isComplex ? settings.models.reasoning : settings.models.chat;
      
      const config: any = {
        systemInstruction: settings.systemPrompt,
        temperature: settings.parameters.temperature,
        topK: settings.parameters.topK,
        topP: settings.parameters.topP,
      };

      if (isComplex && modelName.includes('pro')) {
          config.thinkingConfig = { 
            thinkingLevel: settings.thinkingLevel === 'HIGH' ? ThinkingLevel.HIGH : ThinkingLevel.LOW 
          };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
            { role: 'user', parts: [{ text: input }] }
        ],
        config
      });

      const text = response.text || "I sensed a disturbance in the grid. Could not compute.";

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Connection to the Source interrupted. Please check your API key.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
      if (isSpeaking) return;
      setIsSpeaking(true);
      try {
        const ai = getGemini();
        if (!ai) return;

        const response = await ai.models.generateContent({
            model: settings.models.tts,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
            audio.onended = () => setIsSpeaking(false);
            await audio.play();
        } else {
            setIsSpeaking(false);
        }
      } catch (e) {
          console.error("TTS Error", e);
          setIsSpeaking(false);
      }
  };

  return (
    <Card title="Lumos Link" subtitle="AI Co-Researcher" className="h-full flex flex-col" noPadding>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[600px]">
        {messages.map((msg) => (
            <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-700 text-zinc-300'}`}>
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === 'model' 
                    ? 'bg-zinc-900/80 border border-white/5 text-zinc-300' 
                    : 'bg-cyan-900/30 border border-cyan-500/20 text-cyan-100'
                }`}>
                    {msg.text}
                    {msg.role === 'model' && (
                        <button 
                            onClick={() => speakMessage(msg.text)}
                            disabled={isSpeaking}
                            className="block mt-2 text-cyan-500/50 hover:text-cyan-400 transition-colors"
                        >
                            <Volume2 size={12} />
                        </button>
                    )}
                </div>
            </motion.div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Bot size={16} />
                </div>
                <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-lg flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-cyan-500" />
                    <span className="text-xs text-zinc-500">Accessing the Grid...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Lumos about the field..."
                className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg transition-all disabled:opacity-50"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </Card>
  );
};
