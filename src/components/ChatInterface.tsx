'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Cpu, User, Activity, Sparkles, Scale, ShieldCheck, Zap 
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TelemetryData {
  bpm: number; hrv: number; spo2: number; weight: number;
  muscleMass: number; bodyWater: number; visceralFat: number;
  bmr: number; target: number; phaseAngle: number; pbf: number;
}

export default function ChatInterface({ telemetry, isEmergency = false }: { telemetry: TelemetryData, isEmergency?: boolean }) {
  // CAMBIAMOS EL MENSAJE INICIAL PARA VERIFICAR LA SUBIDA
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `[NEXUS SYNC COMPLETED] Hola Abraham, soy Curie. Monitoreando tus ${telemetry.weight}kg. ¿En qué optimización trabajaremos hoy?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          telemetry,
          isEmergency
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content, 
        timestamp: new Date() 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ Error: No hay respuesta del Nexus. Revisa tu API Key en Vercel.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[900px] bg-slate-950/50 backdrop-blur-2xl border border-cyan-500/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative mx-auto max-w-2xl">
      <div className="bg-slate-900/40 border-b border-cyan-500/10 p-6 flex justify-between items-center backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-pulse"><Cpu size={18} className="text-cyan-400" /></div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-widest uppercase italic font-sans">Helena Intelligence</h3>
            <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">{isEmergency ? '⚠ Emergencia' : 'Online • Nexus Active'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold font-mono text-rose-400 border-rose-500/20 bg-rose-950/30"><Activity size={12} /> {telemetry.bpm} BPM</div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold font-mono text-emerald-400 border-emerald-500/20 bg-emerald-950/30"><Scale size={12} /> {telemetry.weight} kg</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl border ${m.role === 'user' ? 'bg-slate-800/60 border-slate-700 text-slate-200' : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-50'}`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && <div className="text-cyan-500 animate-pulse text-xs italic">Curie está procesando...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-slate-900/40 border-t border-cyan-500/10">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Consulta al Nexus..." className="flex-1 bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50" />
          <button type="submit" disabled={isTyping} className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
}